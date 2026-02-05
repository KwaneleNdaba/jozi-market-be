import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { FRONTEND_URL } from "@config";
import { logger } from "@/utils/logger";

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: HTTPServer): void {
    // Allow multiple origins for development and production
    const allowedOrigins = [
      FRONTEND_URL as string,
      "https://jozi-market.vercel.app", // Production
    ].filter(Boolean);

    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Allow clients to subscribe to specific product updates
      socket.on("subscribe:product", (productId: string) => {
        socket.join(`product:${productId}`);
        logger.info(`Client ${socket.id} subscribed to product ${productId}`);
      });

      // Allow clients to unsubscribe from product updates
      socket.on("unsubscribe:product", (productId: string) => {
        socket.leave(`product:${productId}`);
        logger.info(`Client ${socket.id} unsubscribed from product ${productId}`);
      });

      // Allow clients to subscribe to specific product variant updates
      socket.on("subscribe:variant", (variantId: string) => {
        socket.join(`variant:${variantId}`);
        logger.info(`Client ${socket.id} subscribed to variant ${variantId}`);
      });

      // Allow clients to unsubscribe from variant updates
      socket.on("unsubscribe:variant", (variantId: string) => {
        socket.leave(`variant:${variantId}`);
        logger.info(`Client ${socket.id} unsubscribed from variant ${variantId}`);
      });
    });

    logger.info("Socket.io initialized successfully");
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  // Emit stock update for a product
  public emitProductStockUpdate(productId: string, stockData: any): void {
    if (this.io) {
      this.io.to(`product:${productId}`).emit("stock:update", {
        type: "product",
        productId,
        ...stockData,
      });
      logger.info(`Emitted stock update for product ${productId}`);
    }
  }

  // Emit stock update for a variant
  public emitVariantStockUpdate(variantId: string, stockData: any): void {
    if (this.io) {
      this.io.to(`variant:${variantId}`).emit("stock:update", {
        type: "variant",
        variantId,
        ...stockData,
      });
      logger.info(`Emitted stock update for variant ${variantId}`);
    }
  }

  // Broadcast to all clients (useful for global inventory updates)
  public broadcastStockUpdate(data: any): void {
    if (this.io) {
      this.io.emit("stock:update", data);
      logger.info("Broadcasted stock update to all clients");
    }
  }
}

export const socketService = SocketService.getInstance();
