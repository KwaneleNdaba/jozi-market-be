import { Sequelize } from "sequelize";
import RefreshToken from "@/models/user/refreshToken.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import Category from "@/models/category/category.model";
import Attribute from "@/models/attribute/attribute.model";
import CategoryAttribute from "@/models/category-attribute/categoryAttribute.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import ProductAttributeValue from "@/models/product-attribute-value/productAttributeValue.model";
import SubscriptionPlan from "@/models/subscription-plan/subscriptionPlan.model";
import Feature from "@/models/feature/feature.model";
import SubscriptionFeature from "@/models/subscription-feature/subscriptionFeature.model";
import UserSubscription from "@/models/user-subscription/userSubscription.model";
import SubscriptionTransaction from "@/models/subscription-transaction/subscriptionTransaction.model";
import Cart from "@/models/cart/cart.model";
import CartItem from "@/models/cart-item/cartItem.model";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";
import Return from "@/models/return/return.model";
import ReturnItem from "@/models/return-item/returnItem.model";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config";
import User from "../models/user/user.model";
import { setupAssociations } from "./associations";

// const dbConnection = new Sequelize({
//   dialect: 'mysql',
//   host: DB_HOST,
//   port: 3306,
//   database: DB_NAME,
//   username: DB_USER,
//   password: DB_PASSWORD,
//   dialectOptions: {
//     connectTimeout: 30000,
//   },
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
//   logging: false, // Disable SQL query logging to reduce overhead
// });


//for updating

const dbConnection = new Sequelize({
  dialect: "mysql",
  host: DB_HOST,
  port: 3306,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  dialectOptions: {
    encrypt: true,
    trustServerCertificate: true,
    options: {
      requestTimeout: 30000,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

User.initialize(dbConnection);
RefreshToken.initialize(dbConnection);
VendorApplication.initialize(dbConnection);
Category.initialize(dbConnection);
Attribute.initialize(dbConnection);
CategoryAttribute.initialize(dbConnection);
Product.initialize(dbConnection);
ProductVariant.initialize(dbConnection);
ProductAttributeValue.initialize(dbConnection);
SubscriptionPlan.initialize(dbConnection);
Feature.initialize(dbConnection);
SubscriptionFeature.initialize(dbConnection);
UserSubscription.initialize(dbConnection);
SubscriptionTransaction.initialize(dbConnection);
Cart.initialize(dbConnection);
CartItem.initialize(dbConnection);
Order.initialize(dbConnection);
OrderItem.initialize(dbConnection);
Return.initialize(dbConnection);
ReturnItem.initialize(dbConnection);

setupAssociations();
const syncDatabase = async () => {
  try {
    await dbConnection.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error: any) {
    console.error("Error syncing database:", error);
    
    // Handle MySQL 64-key limit error specifically
    if (error?.parent?.code === "ER_TOO_MANY_KEYS" || error?.code === "ER_TOO_MANY_KEYS") {
      console.warn(
        "Warning: MySQL 64-key limit reached. Some unique constraints may need to be handled at the application level."
      );
      console.warn(
        "If you need to drop an existing unique index, run: DROP INDEX index_name ON table_name;"
      );
      
      // Try to sync individual models that might not have the issue
      try {
        // Sync without alter to avoid modifying existing tables
        await dbConnection.sync({ alter: false });
        console.log("Database models initialized (without altering existing tables)");
      } catch (syncError) {
        console.error("Failed to sync database:", syncError);
        console.log("Database sync failed - manual intervention may be required");
      }
    } else {
      // For other errors, try basic sync
      try {
        await dbConnection.sync({ alter: false });
        console.log("Database synced successfully (basic mode - no alterations)");
      } catch (fallbackError) {
        console.error("Fallback sync failed:", fallbackError);
        console.log("Database sync failed - manual intervention may be required");
      }
    }
  }
};

syncDatabase();

export default dbConnection;
