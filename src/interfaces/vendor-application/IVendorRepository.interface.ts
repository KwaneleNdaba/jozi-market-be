import { Token } from "typedi";
import type {
  ICreateVendorApplication,
  IUpdateVendorApplicationStatus,
  IVendorApplication,
} from "@/types/vendor.types";

export interface IVendorRepository {
  create(applicationData: ICreateVendorApplication): Promise<IVendorApplication>;
  findById(id: string): Promise<IVendorApplication | null>;
  findByUserId(userId: string): Promise<IVendorApplication | null>;
  findByEmail(email: string): Promise<IVendorApplication | null>;
  findAll(status?: string): Promise<IVendorApplication[]>;
  updateStatus(updateData: IUpdateVendorApplicationStatus): Promise<IVendorApplication>;
  updateUserId(id: string, userId: string): Promise<IVendorApplication>;
  delete(id: string): Promise<void>;
}

export const VENDOR_REPOSITORY_TOKEN = new Token<IVendorRepository>("IVendorRepository");
