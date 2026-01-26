import { Token } from "typedi";
import type {
  IReturn,
  IReturnItem,
  ICreateReturn,
  ICreateReturnItem,
  IUpdateReturn,
  IUpdateReturnItem,
  IReturnWithDetails,
} from "@/types/return.types";

export interface IReturnRepository {
  create(returnData: ICreateReturn): Promise<IReturn>;
  findById(id: string): Promise<IReturn | null>;
  findByOrderId(orderId: string): Promise<IReturn | null>;
  findByUserId(userId: string): Promise<IReturn[]>;
  findAll(status?: string): Promise<IReturn[]>;
  update(updateData: IUpdateReturn): Promise<IReturn>;
  createReturnItem(itemData: ICreateReturnItem): Promise<IReturnItem>;
  getReturnWithItems(returnId: string): Promise<IReturn | null>;
  findReturnItemById(returnItemId: string): Promise<IReturnItem | null>;
  updateReturnItem(returnItemId: string, updateData: Partial<IReturnItem>): Promise<IReturnItem>;
  findReturnItemsByReturnId(returnId: string): Promise<IReturnItem[]>;
}

export const RETURN_REPOSITORY_TOKEN = new Token<IReturnRepository>("IReturnRepository");
