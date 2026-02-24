import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config";
import User from "../models/user/user.model";
import RefreshToken from "../models/user/refreshToken.model";
import ProductVariant from "../models/product-variant/productVariant.model";
import Inventory from "../models/inventory/inventory.model";

const dbConnection = new Sequelize({
  dialect: "mysql",
  host: DB_HOST,
  port: 3306,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  logging: false,
});

async function testSync() {
  try {
    console.log("Initializing models...");
    User.initialize(dbConnection);
    RefreshToken.initialize(dbConnection);
    ProductVariant.initialize(dbConnection);
    Inventory.initialize(dbConnection);

    console.log("Syncing database...");
    await dbConnection.sync({ alter: false });
    console.log("✅ Database synced successfully!");

    await dbConnection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await dbConnection.close();
    process.exit(1);
  }
}

testSync();
