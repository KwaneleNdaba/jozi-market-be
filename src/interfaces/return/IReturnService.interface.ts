import { Token } from "typedi";
import type {
  IReturn,
  IReturnItem,
  ICreateReturn,
  IUpdateReturn,
  IUpdateReturnItem,
  IReviewReturn,
  IReviewReturnItem,
  IReturnWithDetails,
} from "@/types/return.types";

export interface IReturnService {
  createReturn(userId: string, returnData: ICreateReturn): Promise<IReturn>;
  getReturnById(id: string): Promise<IReturn | null>;
  getReturnsByUserId(userId: string): Promise<IReturn[]>;
  getAllReturns(status?: string): Promise<IReturn[]>;
  reviewReturn(reviewData: IReviewReturn): Promise<IReturn>;
  reviewReturnItem(reviewData: IReviewReturnItem): Promise<IReturnItem>;
  updateReturnStatus(returnId: string, status: string, userId: string): Promise<IReturn>;
  updateReturnItemStatus(returnItemId: string, status: string, userId: string): Promise<IReturnItem>;
  cancelReturn(returnId: string, userId: string): Promise<IReturn>;
}

export const RETURN_SERVICE_TOKEN = new Token<IReturnService>("IReturnService");
