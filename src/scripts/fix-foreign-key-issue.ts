import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: DB_HOST,
  port: 3306,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  logging: console.log,
});

async function fixForeignKeyIssue() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected successfully!");

    // Check current column types with character set and collation
    console.log("\n=== Checking column types ===");
    
    const [productVariantColumns]: any = await sequelize.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_SET_NAME,
        COLLATION_NAME,
        COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${DB_NAME}'
        AND TABLE_NAME = 'product_variants'
        AND COLUMN_NAME = 'id'
    `);
    console.log("\nproduct_variants.id:");
    console.log(productVariantColumns[0]);

    const [inventoryColumns]: any = await sequelize.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_SET_NAME,
        COLLATION_NAME,
        COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${DB_NAME}'
        AND TABLE_NAME = 'inventories'
        AND COLUMN_NAME = 'productVariantId'
    `);
    console.log("\ninventories.productVariantId:");
    console.log(inventoryColumns[0]);

    // Drop the existing foreign key constraint if it exists
    console.log("\n=== Dropping existing foreign key constraint ===");
    try {
      await sequelize.query(
        "ALTER TABLE `inventories` DROP FOREIGN KEY `inventories_ibfk_1`"
      );
      console.log("Dropped constraint inventories_ibfk_1");
    } catch (error: any) {
      console.log("No constraint to drop or already dropped:", error.message);
    }

    // Get character set and collation from product_variants.id
    const pvCharset = productVariantColumns[0]?.CHARACTER_SET_NAME || 'utf8mb4';
    const pvCollation = productVariantColumns[0]?.COLLATION_NAME || 'utf8mb4_unicode_ci';

    console.log(`\nTarget charset: ${pvCharset}, collation: ${pvCollation}`);

    // Modify inventories.productVariantId to match product_variants.id
    console.log("\n=== Aligning column definitions ===");
    await sequelize.query(`
      ALTER TABLE \`inventories\` 
      MODIFY COLUMN \`productVariantId\` CHAR(36) 
      CHARACTER SET ${pvCharset} 
      COLLATE ${pvCollation} 
      NULL
    `);
    console.log("Modified inventories.productVariantId to match product_variants.id");

    // Recreate the foreign key constraint
    console.log("\n=== Recreating foreign key constraint ===");
    await sequelize.query(
      "ALTER TABLE `inventories` ADD CONSTRAINT `inventories_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE"
    );
    console.log("Foreign key constraint recreated successfully!");

    console.log("\n=== Verification ===");
    const [constraints]: any = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${DB_NAME}'
        AND TABLE_NAME = 'inventories'
        AND REFERENCED_TABLE_NAME = 'product_variants'
    `);
    console.log("Foreign key constraints:", constraints);

    console.log("\n✅ Foreign key issue fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing foreign key issue:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixForeignKeyIssue()
  .then(() => {
    console.log("\nScript completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed:", error);
    process.exit(1);
  });
