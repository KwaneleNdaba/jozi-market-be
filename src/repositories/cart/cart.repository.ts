import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ICartRepository,
  CART_REPOSITORY_TOKEN,
} from "@/interfaces/cart/ICartRepository.interface";
import Cart from "@/models/cart/cart.model";
import CartItem from "@/models/cart-item/cartItem.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import type { ICart, ICartItem, ICreateCartItem, IUpdateCartItem } from "@/types/cart.types";

@Service({ id: CART_REPOSITORY_TOKEN })
export class CartRepository implements ICartRepository {
  public async findOrCreateCart(userId: string): Promise<ICart> {
    try {
      const [cart] = await Cart.findOrCreate({
        where: { userId },
        defaults: { userId },
        raw: false,
      });
      return cart.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findCartByUserId(userId: string): Promise<ICart | null> {
    try {
      const cart = await Cart.findOne({
        where: { userId },
        raw: true,
      });
      return cart;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findCartItemById(id: string): Promise<ICartItem | null> {
    try {
      const cartItem = await CartItem.findByPk(id, {
        include: [
          {
            model: Product,
            as: "product",
            required: false,
          },
          {
            model: ProductVariant,
            as: "variant",
            required: false,
          },
        ],
        raw: false,
      });
      return cartItem ? cartItem.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findCartItemByProduct(
    cartId: string,
    productId: string,
    productVariantId?: string | null
  ): Promise<ICartItem | null> {
    try {
      const where: any = {
        cartId,
        productId,
      };
      if (productVariantId !== undefined && productVariantId !== null) {
        where.productVariantId = productVariantId;
      } else {
        where.productVariantId = null;
      }

      const cartItem = await CartItem.findOne({
        where,
        raw: false,
      });
      return cartItem ? cartItem.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async addCartItem(cartId: string, itemData: ICreateCartItem): Promise<ICartItem> {
    try {
      const cartItem = await CartItem.create({
        cartId,
        productId: itemData.productId,
        productVariantId: itemData.productVariantId || null,
        quantity: itemData.quantity,
      } as any);
      return cartItem.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateCartItem(updateData: IUpdateCartItem): Promise<ICartItem> {
    try {
      const cartItem = await CartItem.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!cartItem) {
        throw new HttpException(404, "Cart item not found");
      }

      await cartItem.update({ quantity: updateData.quantity });
      return cartItem.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async deleteCartItem(id: string): Promise<void> {
    try {
      const cartItem = await CartItem.findOne({
        where: { id },
      });

      if (!cartItem) {
        throw new HttpException(404, "Cart item not found");
      }

      await cartItem.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async clearCart(cartId: string): Promise<void> {
    try {
      await CartItem.destroy({
        where: { cartId },
      });
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getCartWithItems(userId: string): Promise<ICart | null> {
    try {
      const cart = await Cart.findOne({
        where: { userId },
        include: [
          {
            model: CartItem,
            as: "items",
            required: false,
            include: [
              {
                model: Product,
                as: "product",
                required: false,
              },
              {
                model: ProductVariant,
                as: "variant",
                required: false,
              },
            ],
          },
        ],
        raw: false,
      });

      return cart ? cart.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
