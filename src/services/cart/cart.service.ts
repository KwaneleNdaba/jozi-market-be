import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type ICartRepository, CART_REPOSITORY_TOKEN } from "@/interfaces/cart/ICartRepository.interface";
import { type ICartService, CART_SERVICE_TOKEN } from "@/interfaces/cart/ICartService.interface";
import { PRODUCT_REPOSITORY_TOKEN } from "@/interfaces/product/IProductRepository.interface";
import type { IProductRepository } from "@/interfaces/product/IProductRepository.interface";
import { PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/IProductService.interface";
import type { IProductService } from "@/interfaces/product/IProductService.interface";
import type { ICart, ICartItem, IAddToCart, IUpdateCartItem } from "@/types/cart.types";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";

@Service({ id: CART_SERVICE_TOKEN })
export class CartService implements ICartService {
  constructor(
    @Inject(CART_REPOSITORY_TOKEN) private readonly cartRepository: ICartRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN) private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SERVICE_TOKEN) private readonly productService: IProductService
  ) {}

  public async getCart(userId: string): Promise<ICart> {
    try {
      let cart = await this.cartRepository.getCartWithItems(userId);

      if (!cart) {
        // Create cart if it doesn't exist
        cart = await this.cartRepository.findOrCreateCart(userId);
        cart.items = [];
      }

      // Enrich cart items with product details (with signed URLs)
      if (cart.items && cart.items.length > 0) {
        const enrichedItems = await Promise.all(
          cart.items.map(async (item) => {
            const product = await this.productService.getProductById(item.productId);
            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        cart.items = enrichedItems;
      }

      return cart;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async addToCart(userId: string, itemData: IAddToCart): Promise<ICartItem> {
    try {
      // Verify product exists and is active (get enriched product with signed URLs)
      const product = await this.productService.getProductById(itemData.productId);
      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      if (product.status !== "Active") {
        throw new HttpException(400, "Product is not available");
      }

      // If variant is specified, verify it exists and is active
      if (itemData.productVariantId) {
        const variant = product.variants?.find((v: any) => v.id === itemData.productVariantId);
        if (!variant) {
          throw new HttpException(404, "Product variant not found");
        }
        if (variant.status !== "Active") {
          throw new HttpException(400, "Product variant is not available");
        }
        // Check stock
        if (variant.stock < itemData.quantity) {
          throw new HttpException(400, "Insufficient stock for this variant");
        }
      } else {
        // Check initial stock for products without variants
        if (product.technicalDetails?.initialStock !== undefined && product.technicalDetails.initialStock < itemData.quantity) {
          throw new HttpException(400, "Insufficient stock");
        }
      }

      // Get or create cart
      const cart = await this.cartRepository.findOrCreateCart(userId);

      // Check if item already exists in cart
      const existingItem = await this.cartRepository.findCartItemByProduct(
        cart.id!,
        itemData.productId,
        itemData.productVariantId
      );

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + itemData.quantity;
        const updatedItem = await this.cartRepository.updateCartItem({
          id: existingItem.id!,
          quantity: newQuantity,
        });

        // Enrich with product details (with signed URLs)
        const enrichedProduct = await this.productService.getProductById(updatedItem.productId);
        return {
          ...updatedItem,
          product: enrichedProduct || undefined,
        };
      } else {
        // Add new item
        const newItem = await this.cartRepository.addCartItem(cart.id!, {
          productId: itemData.productId,
          productVariantId: itemData.productVariantId,
          quantity: itemData.quantity,
        });

        // Enrich with product details (with signed URLs)
        const enrichedProduct = await this.productService.getProductById(newItem.productId);
        return {
          ...newItem,
          product: enrichedProduct || undefined,
        };
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async updateCartItem(userId: string, updateData: IUpdateCartItem): Promise<ICartItem> {
    try {
      // Verify cart item belongs to user's cart
      const cart = await this.cartRepository.findCartByUserId(userId);
      if (!cart) {
        throw new HttpException(404, "Cart not found");
      }

      const cartItem = await this.cartRepository.findCartItemById(updateData.id);
      if (!cartItem) {
        throw new HttpException(404, "Cart item not found");
      }

      if (cartItem.cartId !== cart.id) {
        throw new HttpException(403, "Cart item does not belong to your cart");
      }

      // Verify stock availability (get enriched product with signed URLs)
      const product = await this.productService.getProductById(cartItem.productId);
      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      if (cartItem.productVariantId) {
        const variant = product.variants?.find((v: any) => v.id === cartItem.productVariantId);
        if (variant && variant.stock < updateData.quantity) {
          throw new HttpException(400, "Insufficient stock for this variant");
        }
      } else {
        if (product.technicalDetails?.initialStock !== undefined && product.technicalDetails.initialStock < updateData.quantity) {
          throw new HttpException(400, "Insufficient stock");
        }
      }

      const updatedItem = await this.cartRepository.updateCartItem(updateData);

      // Enrich with product details (with signed URLs)
      const enrichedProduct = await this.productService.getProductById(updatedItem.productId);
      return {
        ...updatedItem,
        product: enrichedProduct || undefined,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    try {
      // Verify cart item belongs to user's cart
      const cart = await this.cartRepository.findCartByUserId(userId);
      if (!cart) {
        throw new HttpException(404, "Cart not found");
      }

      const cartItem = await this.cartRepository.findCartItemById(cartItemId);
      if (!cartItem) {
        throw new HttpException(404, "Cart item not found");
      }

      if (cartItem.cartId !== cart.id) {
        throw new HttpException(403, "Cart item does not belong to your cart");
      }

      await this.cartRepository.deleteCartItem(cartItemId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async clearCart(userId: string): Promise<void> {
    try {
      const cart = await this.cartRepository.findCartByUserId(userId);
      if (!cart) {
        throw new HttpException(404, "Cart not found");
      }

      await this.cartRepository.clearCart(cart.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
