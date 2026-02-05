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
import { ValidateEnv } from "./utils/validateEnv";

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
  new TestRoute(), // WebSocket testing endpoint
]);

app.listen();
