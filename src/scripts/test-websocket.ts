/**
 * WebSocket Test Script - Emit Stock Update
 * 
 * This script manually triggers a stock update event for testing WebSocket functionality.
 * 
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/test-websocket.ts
 */

import { socketService } from "@/services/socket/socket.service";
import Inventory from "@/models/inventory/inventory.model";
import Product from "@/models/product/product.model";
import sequelize from "@/database";

const PRODUCT_ID = "6b2385f5-49ce-4e53-aa51-6411fe0f8939";
const NEW_STOCK = 5; // Testing real-time update

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

    // Wait a moment to ensure socket service is ready
    console.log("⏳ Waiting for socket service...");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if socket service is initialized
    const io = socketService.getIO();
    if (!io) {
      console.error("❌ Socket.IO server not initialized!");
      console.log("💡 Make sure the backend server is running (npm run dev)");
      process.exit(1);
    }

    console.log("✅ Socket.IO server is ready\n");

    // Emit WebSocket event
    console.log("📡 Emitting WebSocket event...");
    
    socketService.emitProductStockUpdate(PRODUCT_ID, {
      stock: NEW_STOCK,
      quantityAvailable: NEW_STOCK,
      quantityReserved: inventory.get("quantityReserved"),
      reorderLevel: inventory.get("reorderLevel"),
      timestamp: new Date().toISOString(),
    });

    console.log("\n✅ WebSocket event emitted!");
    console.log("\n📱 Frontend should receive update on:");
    console.log(`   Event: stock:update`);
    console.log(`   Data: {`);
    console.log(`     type: "product",`);
    console.log(`     productId: "${PRODUCT_ID}",`);
    console.log(`     stock: ${NEW_STOCK},`);
    console.log(`     quantityAvailable: ${NEW_STOCK},`);
    console.log(`     quantityReserved: ${inventory.get("quantityReserved")},`);
    console.log(`     reorderLevel: ${inventory.get("reorderLevel")},`);
    console.log(`     timestamp: "..."`);
    console.log(`   }\n`);

    console.log("🎉 Test completed!");
    console.log("\n💡 Frontend subscription example:");
    console.log(`   socket.emit('subscribe:product', '${PRODUCT_ID}');`);
    console.log(`   socket.on('stock:update', (data) => console.log(data));\n`);

    // Keep process alive for a few seconds to ensure event is sent
    setTimeout(() => {
      console.log("🔚 Exiting...");
      process.exit(0);
    }, 2000);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testWebSocket();
