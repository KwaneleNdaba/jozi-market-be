/**
 * Migration Script: Create Inventory Records for Existing Products
 * 
 * This script creates inventory records for:
 * 1. Products without variants that don't have inventory records
 * 2. Product variants that don't have inventory records
 * 
 * Run with: npx ts-node src/scripts/create-missing-inventory.ts
 */

import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import Inventory from "@/models/inventory/inventory.model";
import sequelize from "@/database";

async function createMissingInventory() {
  try {
    console.log("🔍 Starting inventory creation for existing products...\n");

    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    let productsUpdated = 0;
    let variantsUpdated = 0;

    // 1. Handle products without variants
    console.log("📦 Checking products without variants...");
    const productsWithoutVariants = await Product.findAll({
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
        },
        {
          model: Inventory,
          as: "inventory",
          required: false,
        },
      ],
      raw: false,
    });

    for (const product of productsWithoutVariants) {
      const productData = product.get({ plain: true }) as any;
      
      // Check if product has no variants and no inventory
      if (
        (!productData.variants || productData.variants.length === 0) &&
        !productData.inventory &&
        productData.initialStock !== null &&
        productData.initialStock !== undefined
      ) {
        await Inventory.create({
          productId: productData.id,
          productVariantId: null,
          quantityAvailable: productData.initialStock,
          quantityReserved: 0,
          reorderLevel: 10,
        } as any);

        console.log(`  ✓ Created inventory for product: ${productData.title} (${productData.sku})`);
        console.log(`    - Stock: ${productData.initialStock}`);
        productsUpdated++;
      }
    }

    console.log(`\n✅ Products updated: ${productsUpdated}\n`);

    // 2. Handle variants without inventory
    console.log("🎨 Checking product variants...");
    const variants = await ProductVariant.findAll({
      include: [
        {
          model: Inventory,
          as: "inventory",
          required: false,
        },
        {
          model: Product,
          as: "product",
          attributes: ["title", "sku"],
        },
      ],
      raw: false,
    });

    for (const variant of variants) {
      const variantData = variant.get({ plain: true }) as any;

      // Check if variant has no inventory
      if (!variantData.inventory) {
        await Inventory.create({
          variantId: variantData.id,
          productVariantId: variantData.id,
          productId: null,
          quantityAvailable: variantData.stock || 0,
          quantityReserved: 0,
          reorderLevel: 10,
        } as any);

        console.log(`  ✓ Created inventory for variant: ${variantData.product?.title} - ${variantData.name} (${variantData.sku})`);
        console.log(`    - Stock: ${variantData.stock || 0}`);
        variantsUpdated++;
      }
    }

    console.log(`\n✅ Variants updated: ${variantsUpdated}\n`);

    console.log("🎉 Migration completed successfully!");
    console.log(`   - Products with inventory created: ${productsUpdated}`);
    console.log(`   - Variants with inventory created: ${variantsUpdated}`);
    console.log(`   - Total inventory records created: ${productsUpdated + variantsUpdated}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating inventory records:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the migration
createMissingInventory();
