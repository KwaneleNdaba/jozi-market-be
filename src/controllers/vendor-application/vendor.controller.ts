import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { VENDOR_SERVICE_TOKEN } from "@/interfaces/vendor-application/IVendorService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IVendorApplication } from "@/types/vendor.types";

export class VendorController {
  private readonly vendorService: any;

  constructor() {
    this.vendorService = Container.get(VENDOR_SERVICE_TOKEN);
  }

  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applicationData = req.body;
      const createdApplication = await this.vendorService.createApplication(applicationData);

      const response: CustomResponse<IVendorApplication> = {
        data: createdApplication,
        message: "Vendor application submitted successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getApplicationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const application = await this.vendorService.getApplicationById(id);

      if (!application) {
        throw new HttpException(404, "Vendor application not found");
      }

      const response: CustomResponse<IVendorApplication> = {
        data: application,
        message: "Vendor application retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getApplicationByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const application = await this.vendorService.getApplicationByUserId(Number(userId));

      const response: CustomResponse<IVendorApplication | null> = {
        data: application,
        message: "Vendor application retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const applications = await this.vendorService.getAllApplications(status as string);

      const response: CustomResponse<IVendorApplication[]> = {
        data: applications,
        message: "Vendor applications retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const result = await this.vendorService.updateApplicationStatus(updateData);

      // If result is null, the application was rejected and deleted
      if (result === null) {
        const response: CustomResponse<null> = {
          data: null,
          message: "Vendor application rejected and deleted successfully",
          error: false,
        };
        res.status(200).json(response);
        return;
      }

      const response: CustomResponse<IVendorApplication> = {
        data: result,
        message: "Vendor application status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.vendorService.deleteApplication(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Vendor application deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
