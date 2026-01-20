import "reflect-metadata";
import { FRONTEND_URL, LOG_FORMAT, NODE_ENV, PORT, SECRET_KEY } from "@config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import passport from "passport";
import { RedisStore } from "rate-limit-redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Container from "typedi";
import { configurePassport } from "./config/passport.config";
import { getRedisClient, initializeRedis } from "./config/redis.config";
import dbConnection from "./database";
import { AUTH_REPOSITORY_TOKEN } from "./interfaces/auth/IAuthRepository .interface";
import { AUTH_SERVICE_TOKEN } from "./interfaces/auth/IAuthService.interface";
import { FILE_UPLOAD_SERVICE_TOKEN } from "./interfaces/file-upload/file-upload.service.interface";
import { VENDOR_REPOSITORY_TOKEN } from "./interfaces/vendor-application/IVendorRepository.interface";
import { VENDOR_SERVICE_TOKEN } from "./interfaces/vendor-application/IVendorService.interface";
import { CATEGORY_REPOSITORY_TOKEN } from "./interfaces/category/ICategoryRepository.interface";
import { CATEGORY_SERVICE_TOKEN } from "./interfaces/category/ICategoryService.interface";
import { ATTRIBUTE_REPOSITORY_TOKEN } from "./interfaces/attribute/IAttributeRepository.interface";
import { ATTRIBUTE_SERVICE_TOKEN } from "./interfaces/attribute/IAttributeService.interface";
import { CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN } from "./interfaces/category-attribute/ICategoryAttributeRepository.interface";
import { CATEGORY_ATTRIBUTE_SERVICE_TOKEN } from "./interfaces/category-attribute/ICategoryAttributeService.interface";
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN } from "./interfaces/product-attribute-value/IProductAttributeValueRepository.interface";
import { PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN } from "./interfaces/product-attribute-value/IProductAttributeValueService.interface";
import { PRODUCT_REPOSITORY_TOKEN } from "./interfaces/product/IProductRepository.interface";
import { PRODUCT_SERVICE_TOKEN } from "./interfaces/product/IProductService.interface";
import { SUBSCRIPTION_PLAN_REPOSITORY_TOKEN } from "./interfaces/subscription-plan/ISubscriptionPlanRepository.interface";
import { SUBSCRIPTION_PLAN_SERVICE_TOKEN } from "./interfaces/subscription-plan/ISubscriptionPlanService.interface";
import { FEATURE_REPOSITORY_TOKEN } from "./interfaces/feature/IFeatureRepository.interface";
import { FEATURE_SERVICE_TOKEN } from "./interfaces/feature/IFeatureService.interface";
import { SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN } from "./interfaces/subscription-feature/ISubscriptionFeatureRepository.interface";
import { SUBSCRIPTION_FEATURE_SERVICE_TOKEN } from "./interfaces/subscription-feature/ISubscriptionFeatureService.interface";
import { USER_SUBSCRIPTION_REPOSITORY_TOKEN } from "./interfaces/user-subscription/IUserSubscriptionRepository.interface";
import { USER_SUBSCRIPTION_SERVICE_TOKEN } from "./interfaces/user-subscription/IUserSubscriptionService.interface";
import { SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN } from "./interfaces/subscription-transaction/ISubscriptionTransactionRepository.interface";
import { SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN } from "./interfaces/subscription-transaction/ISubscriptionTransactionService.interface";
import { CART_REPOSITORY_TOKEN } from "./interfaces/cart/ICartRepository.interface";
import { CART_SERVICE_TOKEN } from "./interfaces/cart/ICartService.interface";
import { ORDER_REPOSITORY_TOKEN } from "./interfaces/order/IOrderRepository.interface";
import { ORDER_SERVICE_TOKEN } from "./interfaces/order/IOrderService.interface";
import { PAYFAST_SERVICE_TOKEN } from "./interfaces/payfast/IPayfastService.interface";
import { apiGatewayMultipartMiddleware } from "./middlewares/apiGatewayMultipart";
import { ErrorMiddleware } from "./middlewares/ErrorMiddleware";
import { AuthRepository } from "./repositories/auth/auth.repository";
import { VendorRepository } from "./repositories/vendor-application/vendor.repository";
import { CategoryRepository } from "./repositories/category/category.repository";
import { AttributeRepository } from "./repositories/attribute/attribute.repository";
import { CategoryAttributeRepository } from "./repositories/category-attribute/categoryAttribute.repository";
import { ProductRepository } from "./repositories/product/product.repository";
import { ProductAttributeValueRepository } from "./repositories/product-attribute-value/productAttributeValue.repository";
import { SubscriptionPlanRepository } from "./repositories/subscription-plan/subscriptionPlan.repository";
import { FeatureRepository } from "./repositories/feature/feature.repository";
import { SubscriptionFeatureRepository } from "./repositories/subscription-feature/subscriptionFeature.repository";
import { UserSubscriptionRepository } from "./repositories/user-subscription/userSubscription.repository";
import { SubscriptionTransactionRepository } from "./repositories/subscription-transaction/subscriptionTransaction.repository";
import { CartRepository } from "./repositories/cart/cart.repository";
import { OrderRepository } from "./repositories/order/order.repository";
import { AuthService } from "./services/auth/auth.service";
import { FileUploadService } from "./services/file-upload/file-upload.service";
import { VendorService } from "./services/vendor-application/vendor.service";
import { CategoryService } from "./services/category/category.service";
import { AttributeService } from "./services/attribute/attribute.service";
import { CategoryAttributeService } from "./services/category-attribute/categoryAttribute.service";
import { ProductService } from "./services/product/product.service";
import { ProductAttributeValueService } from "./services/product-attribute-value/productAttributeValue.service";
import { SubscriptionPlanService } from "./services/subscription-plan/subscriptionPlan.service";
import { FeatureService } from "./services/feature/feature.service";
import { SubscriptionFeatureService } from "./services/subscription-feature/subscriptionFeature.service";
import { UserSubscriptionService } from "./services/user-subscription/userSubscription.service";
import { SubscriptionTransactionService } from "./services/subscription-transaction/subscriptionTransaction.service";
import { CartService } from "./services/cart/cart.service";
import { OrderService } from "./services/order/order.service";
import { PayFastService } from "./services/payfast/payfast.service";
import type { Routes } from "./types/routes.interface";
import { logger, stream } from "./utils/logger";

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private redisClient: any;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 6000;

    this.initializeInterfaces();
    this.initializeRedis();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRateLimiters();
    this.initializePassport();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeUnhandledErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 WATER-HUB listening on port ${this.port}`);
      logger.info(`==================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  public async connectToDatabase() {
    try {
      await dbConnection.authenticate();
      logger.info("Connected to the database successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
      process.exit(1);
    }
  }

  private corsOptions = {
    origin: [FRONTEND_URL as string],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  };

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(cors(this.corsOptions));
    this.app.use(apiGatewayMultipartMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(SECRET_KEY));
    this.app.set("trust proxy", 1);
  }

  private initializeInterfaces() {
    // Register Repositories
    Container.set(AUTH_REPOSITORY_TOKEN, new AuthRepository());
    Container.set(VENDOR_REPOSITORY_TOKEN, new VendorRepository());
    Container.set(CATEGORY_REPOSITORY_TOKEN, new CategoryRepository());
    Container.set(ATTRIBUTE_REPOSITORY_TOKEN, new AttributeRepository());
    Container.set(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN, new CategoryAttributeRepository());
    Container.set(PRODUCT_REPOSITORY_TOKEN, new ProductRepository());
    Container.set(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN, new ProductAttributeValueRepository());
    Container.set(SUBSCRIPTION_PLAN_REPOSITORY_TOKEN, new SubscriptionPlanRepository());
    Container.set(FEATURE_REPOSITORY_TOKEN, new FeatureRepository());
    Container.set(SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN, new SubscriptionFeatureRepository());
    Container.set(USER_SUBSCRIPTION_REPOSITORY_TOKEN, new UserSubscriptionRepository());
    Container.set(SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN, new SubscriptionTransactionRepository());
    Container.set(CART_REPOSITORY_TOKEN, new CartRepository());
    Container.set(ORDER_REPOSITORY_TOKEN, new OrderRepository());

    // Register Services (depend on repositories via tokens)
    Container.set(AUTH_SERVICE_TOKEN, new AuthService(Container.get(AUTH_REPOSITORY_TOKEN)));
    Container.set(FILE_UPLOAD_SERVICE_TOKEN, new FileUploadService());
    Container.set(VENDOR_SERVICE_TOKEN, new VendorService(Container.get(VENDOR_REPOSITORY_TOKEN), Container.get(AUTH_REPOSITORY_TOKEN)));
    Container.set(CATEGORY_SERVICE_TOKEN, new CategoryService(Container.get(CATEGORY_REPOSITORY_TOKEN)));
    Container.set(ATTRIBUTE_SERVICE_TOKEN, new AttributeService(Container.get(ATTRIBUTE_REPOSITORY_TOKEN)));
    Container.set(CATEGORY_ATTRIBUTE_SERVICE_TOKEN, new CategoryAttributeService(Container.get(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN)));
    Container.set(PRODUCT_SERVICE_TOKEN, new ProductService(Container.get(PRODUCT_REPOSITORY_TOKEN), Container.get(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN)));
    Container.set(PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN, new ProductAttributeValueService(Container.get(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN)));
    Container.set(SUBSCRIPTION_PLAN_SERVICE_TOKEN, new SubscriptionPlanService(Container.get(SUBSCRIPTION_PLAN_REPOSITORY_TOKEN)));
    Container.set(FEATURE_SERVICE_TOKEN, new FeatureService(Container.get(FEATURE_REPOSITORY_TOKEN)));
    Container.set(SUBSCRIPTION_FEATURE_SERVICE_TOKEN, new SubscriptionFeatureService(Container.get(SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN)));
    Container.set(USER_SUBSCRIPTION_SERVICE_TOKEN, new UserSubscriptionService(Container.get(USER_SUBSCRIPTION_REPOSITORY_TOKEN)));
    Container.set(SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN, new SubscriptionTransactionService(
      Container.get(SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN),
      Container.get(SUBSCRIPTION_PLAN_REPOSITORY_TOKEN),
      Container.get(USER_SUBSCRIPTION_REPOSITORY_TOKEN)
    ));
    Container.set(CART_SERVICE_TOKEN, new CartService(
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(PRODUCT_REPOSITORY_TOKEN),
      Container.get(PRODUCT_SERVICE_TOKEN)
    ));
    Container.set(ORDER_SERVICE_TOKEN, new OrderService(
      Container.get(ORDER_REPOSITORY_TOKEN),
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(PRODUCT_REPOSITORY_TOKEN),
      Container.get(PRODUCT_SERVICE_TOKEN)
    ));
    Container.set(PAYFAST_SERVICE_TOKEN, new PayFastService(
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(ORDER_REPOSITORY_TOKEN),
      Container.get(ORDER_SERVICE_TOKEN)
    ));
  }

  private initializeRedis() {
    this.redisClient = initializeRedis();
  }

  private initializeRateLimiters() {
    // Make Redis client available in requests
    if (this.redisClient) {
      this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        (req as any).redisClient = this.redisClient;
        next();
      });
    }

    // General DDoS protection rate limiter (10 requests per second)
    if (this.redisClient) {
      const rateLimiter = new RateLimiterRedis({
        storeClient: this.redisClient,
        keyPrefix: "middleware",
        points: 60, // Number of requests
        duration: 10, // Per 1 second
      });

      this.app.use((req, res, next) => {
        rateLimiter
          .consume(req.ip)
          .then(() => {
            next();
          })
          .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
              success: false,
              message: "Too many requests, please try again later.",
            });
          });
      });
    } else {
      // Fallback to in-memory rate limiting if Redis is not available
      const generalLimiter = rateLimit({
        windowMs: 1000, // 1 second
        max: 10, // 10 requests per second
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
          res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
          });
        },
      });
      this.app.use(generalLimiter);
    }

    // IP-based rate limiting for sensitive auth endpoints
    const sensitiveEndpointLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, 
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
        });
      },
      store: this.redisClient
        ? new RedisStore({
            sendCommand: (...args: any[]) => this.redisClient.call(...args),
          })
        : undefined,
    });

    // Apply sensitive endpoint limiter to auth routes
    this.app.use("/api/auth/signup", sensitiveEndpointLimiter);
    this.app.use("/api/auth/login", sensitiveEndpointLimiter);
    this.app.use("/api/auth/send-otp", sensitiveEndpointLimiter);
    this.app.use("/api/auth/verify-otp", sensitiveEndpointLimiter);
    this.app.use("/api/auth/update-password", sensitiveEndpointLimiter);
    this.app.use("/api/auth/update-old-password", sensitiveEndpointLimiter);
  }

  private initializePassport() {
    this.app.use(passport.initialize());
    configurePassport();
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private initializeUnhandledErrorHandling() {
    process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error(`Uncaught Exception: ${error}`);
    });
  }
}
