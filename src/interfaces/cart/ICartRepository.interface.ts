import { Token } from "typedi";
import type { ICart, ICartItem, ICreateCartItem, IUpdateCartItem } from "@/types/cart.types";

export interface ICartRepository {
  findOrCreateCart(userId: string): Promise<ICart>;
  findCartByUserId(userId: string): Promise<ICart | null>;
  findCartItemById(id: string): Promise<ICartItem | null>;
  findCartItemByProduct(cartId: string, productId: string, productVariantId?: string | null): Promise<ICartItem | null>;
  addCartItem(cartId: string, itemData: ICreateCartItem): Promise<ICartItem>;
  updateCartItem(updateData: IUpdateCartItem): Promise<ICartItem>;
  deleteCartItem(id: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  getCartWithItems(userId: string): Promise<ICart | null>;
}

export const CART_REPOSITORY_TOKEN = new Token<ICartRepository>("ICartRepository");
