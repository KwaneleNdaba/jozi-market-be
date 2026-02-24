import "reflect-metadata";
import { FRONTEND_URL, LOG_FORMAT, NODE_ENV, PORT, SECRET_KEY } from "@config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { Server as HTTPServer } from "http";
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
import { socketService } from "./services/socket/socket.service";
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
import { RETURN_REPOSITORY_TOKEN } from "./interfaces/return/IReturnRepository.interface";
import { RETURN_SERVICE_TOKEN } from "./interfaces/return/IReturnService.interface";
import { INVENTORY_REPOSITORY_TOKEN } from "@/interfaces/inventory/IInventoryRepository.interface";
import { INVENTORY_SERVICE_TOKEN } from "@/interfaces/inventory/IInventoryService.interface";
import { POINTS_CONFIG_REPOSITORY_TOKEN } from "@/interfaces/points/IPointsConfigRepository.interface";
import { POINTS_CONFIG_SERVICE_TOKEN } from "@/interfaces/points/IPointsConfigService.interface";
import { TIER_REPOSITORY_TOKEN } from "@/interfaces/points/ITierRepository.interface";
import { TIER_SERVICE_TOKEN } from "@/interfaces/points/ITierService.interface";
import { TIER_BENEFIT_REPOSITORY_TOKEN } from "@/interfaces/points/ITierBenefitRepository.interface";
import { TIER_BENEFIT_SERVICE_TOKEN } from "@/interfaces/points/ITierBenefitService.interface";
import { BENEFIT_REPOSITORY_TOKEN } from "@/interfaces/points/IBenefitRepository.interface";
import { BENEFIT_SERVICE_TOKEN } from "@/interfaces/points/IBenefitService.interface";
import { REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN } from "@/interfaces/points/IReferralRewardConfigRepository.interface";
import { REFERRAL_REWARD_CONFIG_SERVICE_TOKEN } from "@/interfaces/points/IReferralRewardConfigService.interface";
import { REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN } from "@/interfaces/points/IReferralSlotRewardRepository.interface";
import { REFERRAL_SLOT_REWARD_SERVICE_TOKEN } from "@/interfaces/points/IReferralSlotRewardService.interface";
import { EARNING_RULE_REPOSITORY_TOKEN } from "@/interfaces/points/IEarningRuleRepository.interface";
import { EARNING_RULE_SERVICE_TOKEN } from "@/interfaces/points/IEarningRuleService.interface";
import { EXPIRY_RULE_REPOSITORY_TOKEN } from "@/interfaces/points/IExpiryRuleRepository.interface";
import { EXPIRY_RULE_SERVICE_TOKEN } from "@/interfaces/points/IExpiryRuleService.interface";
import { ABUSE_FLAG_REPOSITORY_TOKEN } from "@/interfaces/points/IAbusFlagRepository.interface";
import { ABUSE_FLAG_SERVICE_TOKEN } from "@/interfaces/points/IAbusFlagService.interface";
import { POINTS_HISTORY_REPOSITORY_TOKEN } from "@/interfaces/points/IPointsHistoryRepository.interface";
import { POINTS_HISTORY_SERVICE_TOKEN } from "@/interfaces/points/IPointsHistoryService.interface";
import { USER_POINTS_BALANCE_REPOSITORY_TOKEN } from "@/interfaces/points/IUserPointsBalanceRepository.interface";
import { USER_POINTS_BALANCE_SERVICE_TOKEN } from "@/interfaces/points/IUserPointsBalanceService.interface";
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
import { ReturnRepository } from "./repositories/return/return.repository";
import { InventoryRepository } from "./repositories/inventory/inventory.repository";
import { PointsConfigRepository } from "./repositories/points/pointsConfig.repository";
import { TierRepository } from "./repositories/points/tier.repository";
import { TierBenefitRepository } from "./repositories/points/tierBenefit.repository";
import { BenefitRepository } from "./repositories/points/benefit.repository";
import { ReferralRewardConfigRepository } from "./repositories/points/referralRewardConfig.repository";
import { ReferralSlotRewardRepository } from "./repositories/points/referralSlotReward.repository";
import { EarningRuleRepository } from "./repositories/points/earningRule.repository";
import { ExpiryRuleRepository } from "./repositories/points/expiryRule.repository";
import { AbusFlagRepository } from "./repositories/points/abuseFlag.repository";
import { PointsHistoryRepository } from "./repositories/points/pointsHistory.repository";
import { UserPointsBalanceRepository } from "./repositories/points/userPointsBalance.repository";
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
import { ReturnService } from "./services/return/return.service";
import { InventoryService } from "./services/inventory/inventory.service";
import { PointsConfigService } from "./services/points/pointsConfig.service";
import { TierService } from "./services/points/tier.service";
import { TierBenefitService } from "./services/points/tierBenefit.service";
import { BenefitService } from "./services/points/benefit.service";
import { ReferralRewardConfigService } from "./services/points/referralRewardConfig.service";
import { ReferralSlotRewardService } from "./services/points/referralSlotReward.service";
import { EarningRuleService } from "./services/points/earningRule.service";
import { ExpiryRuleService } from "./services/points/expiryRule.service";
import { AbusFlagService } from "./services/points/abuseFlag.service";
import { PointsHistoryService } from "./services/points/pointsHistory.service";
import { UserPointsBalanceService } from "./services/points/userPointsBalance.service";
import { PayFastService } from "./services/payfast/payfast.service";
import type { Routes } from "./types/routes.interface";
import { logger, stream } from "./utils/logger";

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private redisClient: any;
  private server: HTTPServer | null = null;

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
    const http = require("http");
    this.server = http.createServer(this.app);
    
    // Initialize socket.io
    socketService.initialize(this.server);
    
    this.server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 JOZI-MARKET listening on port ${this.port}`);
      logger.info(`==================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  public getHTTPServer() {
    return this.server;
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
    Container.set(RETURN_REPOSITORY_TOKEN, new ReturnRepository());
    Container.set(INVENTORY_REPOSITORY_TOKEN, new InventoryRepository());
    
    // Points System Repositories
    Container.set(POINTS_CONFIG_REPOSITORY_TOKEN, new PointsConfigRepository());
    Container.set(TIER_REPOSITORY_TOKEN, new TierRepository());
    Container.set(TIER_BENEFIT_REPOSITORY_TOKEN, new TierBenefitRepository());
    Container.set(BENEFIT_REPOSITORY_TOKEN, new BenefitRepository());
    Container.set(REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN, new ReferralRewardConfigRepository());
    Container.set(REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN, new ReferralSlotRewardRepository());
    Container.set(EARNING_RULE_REPOSITORY_TOKEN, new EarningRuleRepository());
    Container.set(EXPIRY_RULE_REPOSITORY_TOKEN, new ExpiryRuleRepository());
    Container.set(ABUSE_FLAG_REPOSITORY_TOKEN, new AbusFlagRepository());
    Container.set(POINTS_HISTORY_REPOSITORY_TOKEN, new PointsHistoryRepository());
    Container.set(USER_POINTS_BALANCE_REPOSITORY_TOKEN, new UserPointsBalanceRepository());

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
    Container.set(INVENTORY_SERVICE_TOKEN, new InventoryService(
      Container.get(INVENTORY_REPOSITORY_TOKEN),
      Container.get(ORDER_REPOSITORY_TOKEN)
    ));
    Container.set(RETURN_SERVICE_TOKEN, new ReturnService(
      Container.get(RETURN_REPOSITORY_TOKEN),
      Container.get(ORDER_REPOSITORY_TOKEN),
      Container.get(INVENTORY_SERVICE_TOKEN),
      Container.get(PRODUCT_SERVICE_TOKEN)
    ));
    Container.set(CART_SERVICE_TOKEN, new CartService(
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(PRODUCT_REPOSITORY_TOKEN),
      Container.get(PRODUCT_SERVICE_TOKEN),
      Container.get(INVENTORY_SERVICE_TOKEN)
    ));
    Container.set(ORDER_SERVICE_TOKEN, new OrderService(
      Container.get(ORDER_REPOSITORY_TOKEN),
      Container.get(RETURN_REPOSITORY_TOKEN),
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(PRODUCT_REPOSITORY_TOKEN),
      Container.get(PRODUCT_SERVICE_TOKEN),
      Container.get(INVENTORY_SERVICE_TOKEN),
      new PointsHistoryService(Container.get(POINTS_HISTORY_REPOSITORY_TOKEN)),
      new UserPointsBalanceService(Container.get(USER_POINTS_BALANCE_REPOSITORY_TOKEN)),
      Container.get(EARNING_RULE_REPOSITORY_TOKEN),
      Container.get(TIER_REPOSITORY_TOKEN),
      Container.get(POINTS_CONFIG_REPOSITORY_TOKEN)
    ));
    Container.set(PAYFAST_SERVICE_TOKEN, new PayFastService(
      Container.get(CART_REPOSITORY_TOKEN),
      Container.get(ORDER_REPOSITORY_TOKEN),
      Container.get(ORDER_SERVICE_TOKEN),
      Container.get(INVENTORY_SERVICE_TOKEN)
    ));
    
    // Points System Services
    Container.set(POINTS_CONFIG_SERVICE_TOKEN, new PointsConfigService(Container.get(POINTS_CONFIG_REPOSITORY_TOKEN)));
    Container.set(TIER_SERVICE_TOKEN, new TierService(Container.get(TIER_REPOSITORY_TOKEN)));
    Container.set(TIER_BENEFIT_SERVICE_TOKEN, new TierBenefitService(Container.get(TIER_BENEFIT_REPOSITORY_TOKEN)));
    Container.set(BENEFIT_SERVICE_TOKEN, new BenefitService(Container.get(BENEFIT_REPOSITORY_TOKEN)));
    Container.set(REFERRAL_REWARD_CONFIG_SERVICE_TOKEN, new ReferralRewardConfigService(Container.get(REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN)));
    Container.set(REFERRAL_SLOT_REWARD_SERVICE_TOKEN, new ReferralSlotRewardService(Container.get(REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN)));
    Container.set(EARNING_RULE_SERVICE_TOKEN, new EarningRuleService(Container.get(EARNING_RULE_REPOSITORY_TOKEN)));
    Container.set(EXPIRY_RULE_SERVICE_TOKEN, new ExpiryRuleService(Container.get(EXPIRY_RULE_REPOSITORY_TOKEN)));
    Container.set(ABUSE_FLAG_SERVICE_TOKEN, new AbusFlagService(Container.get(ABUSE_FLAG_REPOSITORY_TOKEN)));
    Container.set(POINTS_HISTORY_SERVICE_TOKEN, new PointsHistoryService(Container.get(POINTS_HISTORY_REPOSITORY_TOKEN)));
    Container.set(USER_POINTS_BALANCE_SERVICE_TOKEN, new UserPointsBalanceService(Container.get(USER_POINTS_BALANCE_REPOSITORY_TOKEN)));
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
