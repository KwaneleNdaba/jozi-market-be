import { Token } from "typedi";
import type {
  ICreateVendorApplication,
  IUpdateVendorApplicationStatus,
  IVendorApplication,
} from "@/types/vendor.types";

export interface IVendorService {
  createApplication(applicationData: ICreateVendorApplication): Promise<IVendorApplication>;
  getApplicationById(id: string): Promise<IVendorApplication | null>;
  getApplicationByUserId(userId: string): Promise<IVendorApplication | null>;
  getAllApplications(status?: string): Promise<IVendorApplication[]>;
  updateApplicationStatus(updateData: IUpdateVendorApplicationStatus): Promise<IVendorApplication | null>;
  deleteApplication(id: string): Promise<void>;
}

export const VENDOR_SERVICE_TOKEN = new Token<IVendorService>("IVendorService");
