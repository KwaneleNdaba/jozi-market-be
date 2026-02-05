/**
 * Database Migration: Fix Inventory Table Schema
 * 
 * Makes productId and productVariantId nullable in the inventories table
 * so that inventory can be associated with either a product OR a variant, not both.
 * 
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/fix-inventory-schema.ts
 */

import sequelize from "@/database";
import { QueryInterface } from "sequelize";

async function fixInventorySchema() {
  try {
    console.log("🔧 Starting inventory table schema fix...\n");

    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("📝 Modifying inventory table columns...");

    // Drop foreign key constraints first (ignore if they don't exist)
    console.log("Dropping foreign key constraints...");
    try {
      const [constraints]: any = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = 'jozi-market' 
        AND TABLE_NAME = 'inventories' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      `);

      for (const constraint of constraints) {
        try {
          await sequelize.query(`ALTER TABLE inventories DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`, { raw: true });
          console.log(`✓ Dropped FK: ${constraint.CONSTRAINT_NAME}`);
        } catch (e) {
          // Ignore errors
        }
      }
    } catch (e) {
      console.log("Note: Could not drop some constraints");
    }

    // Make productVariantId nullable
    await sequelize.query("ALTER TABLE inventories MODIFY COLUMN productVariantId CHAR(36) NULL", { raw: true });
    console.log("✓ productVariantId set to ALLOW NULL");

    // Make productId nullable  
    await sequelize.query("ALTER TABLE inventories MODIFY COLUMN productId CHAR(36) NULL", { raw: true });
    console.log("✓ productId set to ALLOW NULL");

    // Re-add foreign key constraints
    console.log("Re-adding foreign key constraints...");
    await sequelize.query(`
      ALTER TABLE inventories 
      ADD CONSTRAINT fk_inventory_variant 
      FOREIGN KEY (productVariantId) REFERENCES product_variants(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `, { raw: true });
    
    await sequelize.query(`
      ALTER TABLE inventories 
      ADD CONSTRAINT fk_inventory_product 
      FOREIGN KEY (productId) REFERENCES products(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `, { raw: true });
    console.log("✓ Foreign keys re-added\n");
    console.log("✓ Foreign keys re-added\n");

    console.log("🎉 Schema migration completed successfully!");
    console.log("   Inventory table now allows NULL for both productId and productVariantId\n");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error fixing inventory schema:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the migration
fixInventorySchema();
