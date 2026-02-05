/**
 * WebSocket Test Script - Trigger via HTTP API
 * 
 * This script updates the database and triggers a WebSocket event via HTTP API.
 * 
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/test-websocket.ts
 */

import Inventory from "@/models/inventory/inventory.model";
import Product from "@/models/product/product.model";
import sequelize from "@/database";
import axios from "axios";

const PRODUCT_ID = "6b2385f5-49ce-4e53-aa51-6411fe0f8939";
const NEW_STOCK = 35; // Testing real-time update
const BACKEND_URL = "http://localhost:8000";

async function testWebSocket() {
  try {
    console.log("🧪 WebSocket Stock Update Test");
    console.log("================================\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Get product details
    const product = await Product.findByPk(PRODUCT_ID);
    if (!product) {
      console.error("❌ Product not found");
      process.exit(1);
    }

    console.log(`📦 Product: ${product.get("title")}`);
    console.log(`   SKU: ${product.get("sku")}\n`);

    // Get current inventory
    const inventory = await Inventory.findOne({
      where: { productId: PRODUCT_ID },
    });

    if (!inventory) {
      console.error("❌ Inventory record not found for this product");
      process.exit(1);
    }

    const currentStock = inventory.get("quantityAvailable") as number;
    console.log(`📊 Current Stock: ${currentStock}`);
    console.log(`📊 New Stock: ${NEW_STOCK}\n`);

    // Update inventory in database
    await inventory.update({
      quantityAvailable: NEW_STOCK,
    });

    console.log("✅ Database updated\n");

    // Trigger WebSocket event via backend API
    console.log("📡 Triggering WebSocket event via backend API...\n");
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/test/websocket/stock`,
        { productId: PRODUCT_ID },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );
      
      if (response.status === 200 && response.data) {
        console.log("✅ WebSocket event successfully emitted!");
        console.log(`   quantityAvailable: ${response.data.data.quantityAvailable}`);
        console.log(`   quantityReserved: ${response.data.data.quantityReserved}\n`);
      }
    } catch (apiError: any) {
      if (apiError.response) {
        console.log("❌ Backend API error:", apiError.response.status, apiError.response.data.message);
      } else if (apiError.code === 'ECONNREFUSED') {
        console.log("❌ Backend server not running at", BACKEND_URL);
        console.log("   Please start the backend server: npm run dev\n");
      } else {
        console.log("❌ API request failed:", apiError.message);
      }
      process.exit(1);
    }

    console.log("📱 Frontend should receive WebSocket update:");
    console.log(`   Event: stock:update`);
    console.log(`   Data: {`);
    console.log(`     type: "product",`);
    console.log(`     productId: "${PRODUCT_ID}",`);
    console.log(`     quantityAvailable: ${NEW_STOCK},`);
    console.log(`     quantityReserved: ${inventory.get("quantityReserved")},`);
    console.log(`     reorderLevel: ${inventory.get("reorderLevel")},`);
    console.log(`     stock: ${NEW_STOCK}`);
    console.log(`   }\n`);

    console.log("🎉 Test completed successfully!");
    console.log("\n💡 Check your frontend browser console for:");
    console.log(`   [Socket] 📦 Stock update received: {...}`);
    console.log(`   [ShopPage] ✅ Updated product stock: { oldStock: ${currentStock}, newStock: ${NEW_STOCK} }\n`);

    console.log("🔚 Exiting...\n");
    await sequelize.close();
    process.exit(0);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testWebSocket();
