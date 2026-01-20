import { Token } from "typedi";
import type { ICart, ICartItem, IAddToCart, IUpdateCartItem } from "@/types/cart.types";

export interface ICartService {
  getCart(userId: string): Promise<ICart>;
  addToCart(userId: string, itemData: IAddToCart): Promise<ICartItem>;
  updateCartItem(userId: string, updateData: IUpdateCartItem): Promise<ICartItem>;
  removeFromCart(userId: string, cartItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export const CART_SERVICE_TOKEN = new Token<ICartService>("ICartService");
