import { App } from "./app";
import { AuthRoute } from "./routes/auth/auth.route";
import { FileRoute } from "./routes/file/file";
import { VendorRoute } from "./routes/vendor-application/vendor.route";
import { CategoryRoute } from "./routes/category/category.route";
import { AttributeRoute } from "./routes/attribute/attribute.route";
import { CategoryAttributeRoute } from "./routes/category-attribute/categoryAttribute.route";
import { ProductRoute } from "./routes/product/product.route";
import { ProductAttributeValueRoute } from "./routes/product-attribute-value/productAttributeValue.route";
import { SubscriptionPlanRoute } from "./routes/subscription-plan/subscriptionPlan.route";
import { FeatureRoute } from "./routes/feature/feature.route";
import { SubscriptionFeatureRoute } from "./routes/subscription-feature/subscriptionFeature.route";
import { UserSubscriptionRoute } from "./routes/user-subscription/userSubscription.route";
import { SubscriptionTransactionRoute } from "./routes/subscription-transaction/subscriptionTransaction.route";
import { CartRoute } from "./routes/cart/cart.route";
import { OrderRoute } from "./routes/order/order.route";
import { ReturnRoute } from "./routes/return/return.route";
import { InventoryRoute } from "./routes/inventory/inventory.route";
import { PayFastRoute } from "./routes/payfast/payfast.route";
import { TestRoute } from "./routes/test.route";
import { PointsRoutes } from "./routes/points";
import { ValidateEnv } from "./utils/validateEnv";
import { TierRoute } from "./routes/points/tier.route";
import { ExpiryRuleRoute } from "./routes/points/expiryRule.route";
import { EarningRuleRoute } from "./routes/points/earningRule.route";
import { ReferralSlotRewardRoute } from "./routes/points/referralSlotReward.route";
import { ReferralRewardConfigRoute } from "./routes/points/referralRewardConfig.route";
import { TierBenefitRoute } from "./routes/points/tierBenefit.route";
import { BenefitRoute } from "./routes/points/benefit.route";
import { PointsHistoryRoute } from "./routes/points/pointsHistory.route";
import { UserPointsBalanceRoute } from "./routes/points/userPointsBalance.route";

ValidateEnv();

const app = new App([
  new AuthRoute(),
  new FileRoute(),
  new VendorRoute(),
  new CategoryRoute(),
  new AttributeRoute(),
  new CategoryAttributeRoute(),
  new ProductRoute(),
  new ProductAttributeValueRoute(),
  new SubscriptionPlanRoute(),
  new FeatureRoute(),
  new SubscriptionFeatureRoute(),
  new UserSubscriptionRoute(),
  new SubscriptionTransactionRoute(),
  new CartRoute(),
  new OrderRoute(),
  new ReturnRoute(),
  new InventoryRoute(),
  new PayFastRoute(),
  new PointsRoutes(),
  new TierRoute(), 
  new ExpiryRuleRoute(),
  new EarningRuleRoute(),
  new ReferralSlotRewardRoute(),
  new ReferralRewardConfigRoute(),
  new BenefitRoute(),
  new TierBenefitRoute(),
  new PointsHistoryRoute(),
  new UserPointsBalanceRoute(),
]);

app.listen();
