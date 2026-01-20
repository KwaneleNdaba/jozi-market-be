import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { CART_SERVICE_TOKEN } from "@/interfaces/cart/ICartService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ICart, ICartItem } from "@/types/cart.types";

export class CartController {
  private readonly cartService: any;

  constructor() {
    this.cartService = Container.get(CART_SERVICE_TOKEN);
  }

  public getCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const cart = await this.cartService.getCart(userId);

      const response: CustomResponse<ICart> = {
        data: cart,
        message: "Cart retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public addToCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const itemData = req.body;
      const cartItem = await this.cartService.addToCart(userId, itemData);

      const response: CustomResponse<ICartItem> = {
        data: cartItem,
        message: "Item added to cart successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateCartItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const updateData = req.body;
      const cartItem = await this.cartService.updateCartItem(userId, updateData);

      const response: CustomResponse<ICartItem> = {
        data: cartItem,
        message: "Cart item updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public removeFromCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const { cartItemId } = req.params;
      await this.cartService.removeFromCart(userId, cartItemId);

      const response: CustomResponse<null> = {
        data: null,
        message: "Item removed from cart successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      await this.cartService.clearCart(userId);

      const response: CustomResponse<null> = {
        data: null,
        message: "Cart cleared successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
