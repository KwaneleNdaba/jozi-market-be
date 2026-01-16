import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IVendorRepository, VENDOR_REPOSITORY_TOKEN } from "@/interfaces/vendor-application/IVendorRepository.interface";
import { type IVendorService, VENDOR_SERVICE_TOKEN } from "@/interfaces/vendor-application/IVendorService.interface";
import { AUTH_REPOSITORY_TOKEN } from "@/interfaces/auth/IAuthRepository .interface";
import { type IAuthRepository } from "@/interfaces/auth/IAuthRepository .interface";
import type { ICreateVendorApplication, IUpdateVendorApplicationStatus, IVendorApplication, VendorFiles } from "@/types/vendor.types";
import { Role } from "@/types/auth.types";
import { getDownloadSignedUrl } from "@/utils/s3";
import { sendMail } from "@/utils/email/email";
import { vendorApplicationConfirmationTemplate } from "@/utils/email/templates/vendor-application-submission";
import { vendorApprovalTemplate } from "@/utils/email/templates/vendor-application-approval";
import { vendorRejectionTemplate } from "@/utils/email/templates/vendor-application-decline";
import { logger } from "@/utils/logger";
import { VendorApplicationStatus } from "@/types/vendor.types";
import crypto from "node:crypto";
import { hash } from "bcryptjs";

@Service({ id: VENDOR_SERVICE_TOKEN })
export class VendorService implements IVendorService {
  constructor(
    @Inject(VENDOR_REPOSITORY_TOKEN) private readonly vendorRepository: IVendorRepository,
    @Inject(AUTH_REPOSITORY_TOKEN) private readonly authRepository: IAuthRepository
  ) {}

  public async createApplication(applicationData: ICreateVendorApplication): Promise<IVendorApplication> {
    try {
      // Check if email is already used
      const existingEmailApplication = await this.vendorRepository.findByEmail(applicationData.email);
      if (existingEmailApplication) {
        throw new HttpException(409, "An application with this email already exists");
      }

      const createdApplication = await this.vendorRepository.create(applicationData);

      // Send confirmation email after successful application creation
      try {
        const emailHtml = vendorApplicationConfirmationTemplate(
          applicationData.contactPerson,
          applicationData.shopName
        );
        const emailText = `Hello ${applicationData.contactPerson},\n\nThank you for applying to join the Jozi Market collective. We have received your artisan application for ${applicationData.shopName}. Our Hub Stewards are currently reviewing your details.\n\nCurrent Phase: Artisan Quality Audit\n\nWhat happens next?\n1. Quality Review: We verify your workshop's local production status (24-48h).\n2. Activation Call: If approved, a Liaison will contact you to finalize your storefront.\n3. First Drop: Initialize your first inventory vault and start selling!\n\nBest regards,\nThe Jozi Market Collective`;

        await sendMail(
          applicationData.email,
          "Jozi Market - Application Received",
          emailText,
          emailHtml
        );
        logger.info(`Vendor application confirmation email sent to ${applicationData.email}`);
      } catch (emailError) {
        // Log email error but don't fail the application creation
        logger.error(`Failed to send vendor application confirmation email to ${applicationData.email}:`, emailError);
      }

      return createdApplication;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  private async enrichWithSignedUrls(application: IVendorApplication): Promise<IVendorApplication> {
    if (!application.files) {
      return application;
    }

    const enrichedFiles: VendorFiles = { ...application.files };
    const userId = application.userId;

    // Generate signed URLs for all file fields
    const fileFields: (keyof VendorFiles)[] = ['logoUrl', 'bannerUrl', 'idDocUrl', 'bankProofUrl', 'addressProofUrl', 'cipcDocUrl'];
    
    for (const field of fileFields) {
      if (enrichedFiles[field]) {
        try {
          const fileUrl = enrichedFiles[field]!;
          
          // Extract S3 key from URL or use as-is if it's already a key
          let s3Key: string;
          
          if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            // Extract key from full S3 URL
            // Format: https://bucket.s3.region.amazonaws.com/jozi-makert-files/filename
            const urlParts = fileUrl.split('/');
            const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
            if (keyIndex !== -1) {
              s3Key = urlParts.slice(keyIndex).join('/');
            } else {
              // Fallback: use filename from URL
              s3Key = `jozi-makert-files/${urlParts[urlParts.length - 1]}`;
            }
          } else if (fileUrl.startsWith('jozi-makert-files/')) {
            // Already a key
            s3Key = fileUrl;
          } else {
            // Just a filename, construct the key
            s3Key = userId 
              ? `jozi-makert-files/${userId}/${fileUrl}`
              : `jozi-makert-files/${fileUrl}`;
          }
          
          // Generate signed URL (expires in 1 hour)
          enrichedFiles[field] = await getDownloadSignedUrl(s3Key, undefined, 3600);
        } catch (error) {
          // If signed URL generation fails, keep original URL
          console.error(`Failed to generate signed URL for ${field}:`, error);
        }
      }
    }

    return {
      ...application,
      files: enrichedFiles,
    };
  }

  public async getApplicationById(id: string): Promise<IVendorApplication | null> {
    try {
      const application = await this.vendorRepository.findById(id);
      if (!application) {
        return null;
      }
      return await this.enrichWithSignedUrls(application);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getApplicationByUserId(userId: string): Promise<IVendorApplication | null> {
    try {
      const application = await this.vendorRepository.findByUserId(userId);
      if (!application) {
        return null;
      }
      return await this.enrichWithSignedUrls(application);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllApplications(status?: string): Promise<IVendorApplication[]> {
    try {
      const applications = await this.vendorRepository.findAll(status);
      // Enrich all applications with signed URLs
      return await Promise.all(applications.map(app => this.enrichWithSignedUrls(app)));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateApplicationStatus(updateData: IUpdateVendorApplicationStatus): Promise<IVendorApplication | null> {
    try {
      if (!updateData.id || !updateData.status || !updateData.reviewedBy) {
        throw new HttpException(400, "Application ID, status, and reviewer ID are required");
      }

      const application = await this.vendorRepository.findById(updateData.id);
      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      if (updateData.status === VendorApplicationStatus.REJECTED && !updateData.rejectionReason) {
        throw new HttpException(400, "Rejection reason is required when rejecting an application");
      }

      // Store application data for email before deletion
      const vendorName = application.contactPerson;
      const storeName = application.shopName;
      const vendorEmail = application.email;

      // If rejecting, delete the application permanently after sending email
      if (updateData.status === VendorApplicationStatus.REJECTED) {
        // Send rejection email first
        try {
          const rejectionReason = updateData.rejectionReason || "Please review your application and try again.";
          const emailHtml = vendorRejectionTemplate(vendorName, storeName, rejectionReason);
          const emailText = `Hello ${vendorName},\n\nThank you for your interest in joining the Jozi Market collective. Our Hub Stewards have carefully audited your artisan application for ${storeName}.\n\nAt this stage, we are unable to approve your storefront for the following reason:\n\n${rejectionReason}\n\nCan I re-apply?\nAbsolutely. Jozi Market is committed to local growth. Once you have addressed the feedback above, you may initialize a new application sequence via the Artisan Portal.\n\nWe appreciate the craft and dedication required to build a local brand. While we can't welcome you to the collective today, we encourage you to continue refining your workshop's artifacts.\n\nBest regards,\nThe Jozi Market Collective`;

          await sendMail(
            vendorEmail,
            "Jozi Market - Application Update",
            emailText,
            emailHtml
          );
          logger.info(`Vendor application rejection email sent to ${vendorEmail}`);
        } catch (emailError) {
          // Log email error but continue with deletion
          logger.error(`Failed to send vendor application rejection email:`, emailError);
        }

        // Delete the application permanently
        await this.vendorRepository.delete(updateData.id);
        logger.info(`Vendor application ${updateData.id} deleted after rejection`);
        
        // Return null to indicate the application was deleted
        return null;
      }

      // For approval, create vendor user and link to application
      let vendorUser;
      
      // Check if user already exists with this email
      const existingUser = await this.authRepository.findUserByEmail(vendorEmail);
      
      if (existingUser) {
        // Update existing user to vendor role
        await this.authRepository.updateUser({
          id: existingUser.id!,
          role: Role.VENDOR,
        });
        vendorUser = await this.authRepository.findUserById(existingUser.id!);
        logger.info(`Updated existing user ${existingUser.id} to vendor role`);
      } else {
        // Create new vendor user
        // Generate a random password (vendor will need to reset it)
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await hash(randomPassword, 10);
        
        // Convert address object to string format
        const addressString = application.address 
          ? `${application.address.street}, ${application.address.city}, ${application.address.postal}, ${application.address.country}`
          : undefined;

        vendorUser = await this.authRepository.createUser({
          email: vendorEmail,
          fullName: vendorName,
          password: hashedPassword,
          role: Role.VENDOR,
          phone: application.phone,
          profileUrl: application.files?.logoUrl,
          address: addressString,
          isAccountBlocked: false,
          canReview: false,
          isPhoneConfirmed: false,
          isEmailConfirmed: true, // Email is confirmed since they applied
        });
        
        logger.info(`Created new vendor user with ID ${vendorUser.id} for application ${updateData.id}`);
      }

      // Update application status and link to user
      const updatedApplication = await this.vendorRepository.updateStatus(updateData);
      
      // Link the application to the user
      if (vendorUser && vendorUser.id) {
        await this.vendorRepository.updateUserId(updateData.id, vendorUser.id);
        logger.info(`Linked vendor application ${updateData.id} to user ${vendorUser.id}`);
      }

      // Send approval email
      try {
        const emailHtml = vendorApprovalTemplate(vendorName, storeName);
        const emailText = `Hello ${vendorName},\n\nThe wait is over. Our Hub Stewards have verified your artifacts and production process. We are thrilled to officially welcome ${storeName} to the Jozi Market artisan family.\n\nAccount Verified & Active\n\nInitialization Checklist:\n✅ Artisan Profile: Finalize your workshop story and logo.\n🚀 First Drop: Upload your initial 5 product listings.\n📦 Logistics Hub: Connect your primary dispatch zone.\n\nYou now have full access to the Artisan Intelligence suite and Capital Ledger. Your digital storefront is ready for the first wave of Jozi seekers.\n\nBest regards,\nThe Jozi Market Collective`;

        await sendMail(
          vendorEmail,
          "Jozi Market - Welcome to the Collective",
          emailText,
          emailHtml
        );
        logger.info(`Vendor application approval email sent to ${vendorEmail}`);
      } catch (emailError) {
        // Log email error but don't fail the status update
        logger.error(`Failed to send vendor application approval email:`, emailError);
      }

      // Fetch the updated application with userId
      const finalApplication = await this.vendorRepository.findById(updateData.id);
      return finalApplication ? await this.enrichWithSignedUrls(finalApplication) : null;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteApplication(id: string): Promise<void> {
    try {
      const application = await this.vendorRepository.findById(id);
      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      await this.vendorRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
