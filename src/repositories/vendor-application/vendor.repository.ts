import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IVendorRepository,
  VENDOR_REPOSITORY_TOKEN,
} from "@/interfaces/vendor-application/IVendorRepository.interface";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import {
  type ICreateVendorApplication,
  type IUpdateVendorApplicationStatus,
  type IVendorApplication,
  VendorApplicationStatus,
} from "@/types/vendor.types";

@Service({ id: VENDOR_REPOSITORY_TOKEN })
export class VendorRepository implements IVendorRepository {
  public async create(applicationData: ICreateVendorApplication): Promise<IVendorApplication> {
    try {
      const createdApplication = await VendorApplication.create(applicationData as any, {
        raw: false,
      });

      return createdApplication.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IVendorApplication | null> {
    try {
      const application = await VendorApplication.findByPk(id, { raw: true });
      return application;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IVendorApplication | null> {
    try {
      const application = await VendorApplication.findOne({
        where: { userId },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      return application;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByEmail(email: string): Promise<IVendorApplication | null> {
    try {
      const application = await VendorApplication.findOne({
        where: { email },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      return application;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<IVendorApplication[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const applications = await VendorApplication.findAll({
        where,
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return applications;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateStatus(
    updateData: IUpdateVendorApplicationStatus
  ): Promise<IVendorApplication> {
    try {
      const application = await VendorApplication.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      const updatePayload: any = {
        status: updateData.status,
        reviewedBy: updateData.reviewedBy,
        reviewedAt: new Date(),
      };

      if (updateData.status === VendorApplicationStatus.REJECTED && updateData.rejectionReason) {
        updatePayload.rejectionReason = updateData.rejectionReason;
      } else if (updateData.status === VendorApplicationStatus.APPROVED) {
        updatePayload.rejectionReason = null;
      }

      await application.update(updatePayload);

      return application.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async updateUserId(id: string, userId: string): Promise<IVendorApplication> {
    try {
      const application = await VendorApplication.findOne({
        where: { id },
        raw: false,
      });

      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      await application.update({ userId });

      return application.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const application = await VendorApplication.findOne({
        where: { id },
      });

      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      await application.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
