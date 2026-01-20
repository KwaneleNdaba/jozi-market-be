import { Router } from "express";
import { AddToCartDto, UpdateCartItemDto } from "@/dots/cart/cart.dot";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { CartController } from "../../controllers/cart/cart.controller";

export class CartRoute implements Routes {
  public path = "/cart";
  public router = Router();
  public cart = new CartController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get cart (authenticated users only)
    this.router.get(
      `${this.path}`,
      authorizationMiddleware,
      this.cart.getCart
    );

    // Add item to cart (authenticated users only)
    this.router.post(
      `${this.path}/items`,
      authorizationMiddleware,
      ValidationMiddleware(AddToCartDto),
      this.cart.addToCart
    );

    // Update cart item (authenticated users only)
    this.router.put(
      `${this.path}/items`,
      authorizationMiddleware,
      ValidationMiddleware(UpdateCartItemDto),
      this.cart.updateCartItem
    );

    // Remove item from cart (authenticated users only)
    this.router.delete(
      `${this.path}/items/:cartItemId`,
      authorizationMiddleware,
      this.cart.removeFromCart
    );

    // Clear cart (authenticated users only)
    this.router.delete(
      `${this.path}`,
      authorizationMiddleware,
      this.cart.clearCart
    );
  }
}
