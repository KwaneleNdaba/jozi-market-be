import "reflect-metadata";
import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "@/config";
import Category from "@/models/category/category.model";
import Attribute from "@/models/attribute/attribute.model";
import CategoryAttribute from "@/models/category-attribute/categoryAttribute.model";
import { CategoryStatus } from "@/types/category.types";
import { AttributeType } from "@/types/attribute.types";

// Create database connection for seeding
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
  logging: false, // Disable SQL query logging
});

// Categories data (parent categories first, then subcategories)
const categories = [
  // Top-level categories
  {
    name: "Electronics",
    description: "Electronic devices, gadgets, and accessories",
    status: CategoryStatus.ACTIVE,
    icon: "electronics",
    subcategories: [
      { name: "Smartphones", description: "Mobile phones and smartphones" },
      { name: "Laptops", description: "Laptop computers and notebooks" },
      { name: "Tablets", description: "Tablet devices and e-readers" },
      { name: "Audio Devices", description: "Headphones, speakers, and audio equipment" },
      { name: "Cameras", description: "Digital cameras and photography equipment" },
    ],
  },
  {
    name: "Clothing & Apparel",
    description: "Fashion, clothing, and accessories",
    status: CategoryStatus.ACTIVE,
    icon: "clothing",
    subcategories: [
      { name: "Men's Clothing", description: "Clothing for men" },
      { name: "Women's Clothing", description: "Clothing for women" },
      { name: "Kids' Clothing", description: "Clothing for children" },
      { name: "Shoes", description: "Footwear for all ages" },
      { name: "Accessories", description: "Bags, jewelry, watches, and more" },
    ],
  },
  {
    name: "Home & Living",
    description: "Furniture, decor, and home essentials",
    status: CategoryStatus.ACTIVE,
    icon: "home",
    subcategories: [
      { name: "Furniture", description: "Chairs, tables, sofas, and more" },
      { name: "Kitchen & Dining", description: "Kitchen appliances and dining items" },
      { name: "Bedding", description: "Bed sheets, pillows, and bedroom accessories" },
      { name: "Home Decor", description: "Decorative items and home accessories" },
      { name: "Garden & Outdoor", description: "Outdoor furniture and garden supplies" },
    ],
  },
  {
    name: "Food & Beverages",
    description: "Food products, beverages, and consumables",
    status: CategoryStatus.ACTIVE,
    icon: "food",
    subcategories: [
      { name: "Fresh Produce", description: "Fresh fruits and vegetables" },
      { name: "Dairy Products", description: "Milk, cheese, yogurt, and dairy items" },
      { name: "Beverages", description: "Drinks, juices, and beverages" },
      { name: "Snacks", description: "Chips, cookies, and snack foods" },
      { name: "Pantry Staples", description: "Rice, pasta, canned goods, and staples" },
    ],
  },
  {
    name: "Health & Beauty",
    description: "Health products, cosmetics, and personal care",
    status: CategoryStatus.ACTIVE,
    icon: "beauty",
    subcategories: [
      { name: "Skincare", description: "Face creams, serums, and skincare products" },
      { name: "Makeup", description: "Cosmetics and makeup products" },
      { name: "Hair Care", description: "Shampoos, conditioners, and hair products" },
      { name: "Personal Care", description: "Soaps, deodorants, and personal hygiene" },
      { name: "Health Supplements", description: "Vitamins and health supplements" },
    ],
  },
  {
    name: "Sports & Outdoors",
    description: "Sports equipment, fitness gear, and outdoor activities",
    status: CategoryStatus.ACTIVE,
    icon: "sports",
    subcategories: [
      { name: "Fitness Equipment", description: "Exercise machines and fitness gear" },
      { name: "Sports Apparel", description: "Activewear and sports clothing" },
      { name: "Outdoor Gear", description: "Camping, hiking, and outdoor equipment" },
      { name: "Sports Accessories", description: "Balls, rackets, and sports accessories" },
    ],
  },
];

// Attributes data
const attributes = [
  // General attributes
  { name: "Brand", slug: "brand", type: AttributeType.TEXT },
  { name: "Model", slug: "model", type: AttributeType.TEXT },
  { name: "Color", slug: "color", type: AttributeType.SELECT },
  { name: "Size", slug: "size", type: AttributeType.SELECT },
  { name: "Material", slug: "material", type: AttributeType.SELECT },
  { name: "Weight", slug: "weight", type: AttributeType.NUMBER, unit: "kg" },
  { name: "Dimensions", slug: "dimensions", type: AttributeType.TEXT },
  { name: "Warranty", slug: "warranty", type: AttributeType.TEXT },
  { name: "Country of Origin", slug: "country-of-origin", type: AttributeType.TEXT },
  { name: "Description", slug: "description", type: AttributeType.TEXTAREA },

  // Electronics-specific
  { name: "Screen Size", slug: "screen-size", type: AttributeType.NUMBER, unit: "inches" },
  { name: "Storage Capacity", slug: "storage-capacity", type: AttributeType.SELECT },
  { name: "RAM", slug: "ram", type: AttributeType.SELECT },
  { name: "Processor", slug: "processor", type: AttributeType.TEXT },
  { name: "Battery Life", slug: "battery-life", type: AttributeType.NUMBER, unit: "hours" },
  { name: "Operating System", slug: "operating-system", type: AttributeType.SELECT },
  { name: "Connectivity", slug: "connectivity", type: AttributeType.SELECT },
  { name: "Camera Resolution", slug: "camera-resolution", type: AttributeType.TEXT },

  // Clothing-specific
  { name: "Gender", slug: "gender", type: AttributeType.SELECT },
  { name: "Age Group", slug: "age-group", type: AttributeType.SELECT },
  { name: "Fabric Type", slug: "fabric-type", type: AttributeType.SELECT },
  { name: "Care Instructions", slug: "care-instructions", type: AttributeType.TEXTAREA },
  { name: "Fit Type", slug: "fit-type", type: AttributeType.SELECT },
  { name: "Season", slug: "season", type: AttributeType.SELECT },
  { name: "Pattern", slug: "pattern", type: AttributeType.SELECT },

  // Food-specific
  { name: "Expiry Date", slug: "expiry-date", type: AttributeType.TEXT },
  { name: "Net Weight", slug: "net-weight", type: AttributeType.NUMBER, unit: "g" },
  { name: "Ingredients", slug: "ingredients", type: AttributeType.TEXTAREA },
  { name: "Allergen Information", slug: "allergen-information", type: AttributeType.TEXTAREA },
  { name: "Nutritional Information", slug: "nutritional-information", type: AttributeType.TEXTAREA },
  { name: "Storage Instructions", slug: "storage-instructions", type: AttributeType.TEXTAREA },
  { name: "Organic", slug: "organic", type: AttributeType.BOOLEAN },
  { name: "Halal Certified", slug: "halal-certified", type: AttributeType.BOOLEAN },

  // Home & Living
  { name: "Room Type", slug: "room-type", type: AttributeType.SELECT },
  { name: "Assembly Required", slug: "assembly-required", type: AttributeType.BOOLEAN },
  { name: "Capacity", slug: "capacity", type: AttributeType.NUMBER },
  { name: "Power Consumption", slug: "power-consumption", type: AttributeType.NUMBER, unit: "W" },
  { name: "Energy Rating", slug: "energy-rating", type: AttributeType.SELECT },

  // Health & Beauty
  { name: "Skin Type", slug: "skin-type", type: AttributeType.SELECT },
];

// Category-Attribute mappings with options and requirements
const categoryAttributeMappings: {
  categoryName: string;
  subcategoryName?: string;
  attributes: {
    attributeSlug: string;
    isRequired: boolean;
    options?: string[];
    displayOrder: number;
  }[];
}[] = [
  // Electronics - Smartphones
  {
    categoryName: "Electronics",
    subcategoryName: "Smartphones",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "model", isRequired: true, displayOrder: 2 },
      { attributeSlug: "color", isRequired: true, options: ["Black", "White", "Blue", "Red", "Gold", "Silver"], displayOrder: 3 },
      { attributeSlug: "storage-capacity", isRequired: true, options: ["64GB", "128GB", "256GB", "512GB", "1TB"], displayOrder: 4 },
      { attributeSlug: "ram", isRequired: true, options: ["4GB", "6GB", "8GB", "12GB", "16GB"], displayOrder: 5 },
      { attributeSlug: "screen-size", isRequired: true, displayOrder: 6 },
      { attributeSlug: "operating-system", isRequired: true, options: ["iOS", "Android"], displayOrder: 7 },
      { attributeSlug: "battery-life", isRequired: false, displayOrder: 8 },
      { attributeSlug: "camera-resolution", isRequired: false, displayOrder: 9 },
      { attributeSlug: "warranty", isRequired: false, displayOrder: 10 },
    ],
  },
  // Electronics - Laptops
  {
    categoryName: "Electronics",
    subcategoryName: "Laptops",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "model", isRequired: true, displayOrder: 2 },
      { attributeSlug: "processor", isRequired: true, displayOrder: 3 },
      { attributeSlug: "ram", isRequired: true, options: ["4GB", "8GB", "16GB", "32GB"], displayOrder: 4 },
      { attributeSlug: "storage-capacity", isRequired: true, options: ["256GB", "512GB", "1TB", "2TB"], displayOrder: 5 },
      { attributeSlug: "screen-size", isRequired: true, displayOrder: 6 },
      { attributeSlug: "operating-system", isRequired: true, options: ["Windows", "macOS", "Linux", "Chrome OS"], displayOrder: 7 },
      { attributeSlug: "weight", isRequired: false, displayOrder: 8 },
      { attributeSlug: "battery-life", isRequired: false, displayOrder: 9 },
      { attributeSlug: "warranty", isRequired: false, displayOrder: 10 },
    ],
  },
  // Clothing - Men's Clothing
  {
    categoryName: "Clothing & Apparel",
    subcategoryName: "Men's Clothing",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "gender", isRequired: true, options: ["Male"], displayOrder: 2 },
      { attributeSlug: "size", isRequired: true, options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"], displayOrder: 3 },
      { attributeSlug: "color", isRequired: true, options: ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown", "Navy"], displayOrder: 4 },
      { attributeSlug: "material", isRequired: true, options: ["Cotton", "Polyester", "Wool", "Linen", "Silk", "Denim", "Leather"], displayOrder: 5 },
      { attributeSlug: "fabric-type", isRequired: false, options: ["100% Cotton", "Cotton Blend", "Synthetic", "Natural"], displayOrder: 6 },
      { attributeSlug: "fit-type", isRequired: false, options: ["Slim", "Regular", "Relaxed", "Oversized"], displayOrder: 7 },
      { attributeSlug: "season", isRequired: false, options: ["Spring", "Summer", "Fall", "Winter", "All Season"], displayOrder: 8 },
      { attributeSlug: "care-instructions", isRequired: false, displayOrder: 9 },
    ],
  },
  // Clothing - Women's Clothing
  {
    categoryName: "Clothing & Apparel",
    subcategoryName: "Women's Clothing",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "gender", isRequired: true, options: ["Female"], displayOrder: 2 },
      { attributeSlug: "size", isRequired: true, options: ["XS", "S", "M", "L", "XL", "XXL"], displayOrder: 3 },
      { attributeSlug: "color", isRequired: true, options: ["Black", "White", "Pink", "Red", "Blue", "Purple", "Yellow", "Green"], displayOrder: 4 },
      { attributeSlug: "material", isRequired: true, options: ["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim"], displayOrder: 5 },
      { attributeSlug: "fabric-type", isRequired: false, options: ["100% Cotton", "Cotton Blend", "Synthetic", "Natural"], displayOrder: 6 },
      { attributeSlug: "fit-type", isRequired: false, options: ["Slim", "Regular", "Relaxed", "Oversized"], displayOrder: 7 },
      { attributeSlug: "pattern", isRequired: false, options: ["Solid", "Striped", "Polka Dot", "Floral", "Geometric", "Abstract"], displayOrder: 8 },
      { attributeSlug: "season", isRequired: false, options: ["Spring", "Summer", "Fall", "Winter", "All Season"], displayOrder: 9 },
      { attributeSlug: "care-instructions", isRequired: false, displayOrder: 10 },
    ],
  },
  // Food - Fresh Produce
  {
    categoryName: "Food & Beverages",
    subcategoryName: "Fresh Produce",
    attributes: [
      { attributeSlug: "net-weight", isRequired: true, displayOrder: 1 },
      { attributeSlug: "country-of-origin", isRequired: false, displayOrder: 2 },
      { attributeSlug: "organic", isRequired: false, displayOrder: 3 },
      { attributeSlug: "storage-instructions", isRequired: false, displayOrder: 4 },
      { attributeSlug: "expiry-date", isRequired: false, displayOrder: 5 },
    ],
  },
  // Food - Beverages
  {
    categoryName: "Food & Beverages",
    subcategoryName: "Beverages",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "net-weight", isRequired: true, displayOrder: 2 },
      { attributeSlug: "ingredients", isRequired: true, displayOrder: 3 },
      { attributeSlug: "allergen-information", isRequired: false, displayOrder: 4 },
      { attributeSlug: "nutritional-information", isRequired: false, displayOrder: 5 },
      { attributeSlug: "storage-instructions", isRequired: false, displayOrder: 6 },
      { attributeSlug: "expiry-date", isRequired: true, displayOrder: 7 },
    ],
  },
  // Home - Furniture
  {
    categoryName: "Home & Living",
    subcategoryName: "Furniture",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "material", isRequired: true, options: ["Wood", "Metal", "Plastic", "Glass", "Fabric", "Leather"], displayOrder: 2 },
      { attributeSlug: "color", isRequired: true, options: ["Brown", "Black", "White", "Gray", "Beige", "Natural"], displayOrder: 3 },
      { attributeSlug: "dimensions", isRequired: true, displayOrder: 4 },
      { attributeSlug: "weight", isRequired: false, displayOrder: 5 },
      { attributeSlug: "room-type", isRequired: false, options: ["Living Room", "Bedroom", "Dining Room", "Office", "Kitchen", "Outdoor"], displayOrder: 6 },
      { attributeSlug: "assembly-required", isRequired: false, displayOrder: 7 },
      { attributeSlug: "warranty", isRequired: false, displayOrder: 8 },
    ],
  },
  // Health - Skincare
  {
    categoryName: "Health & Beauty",
    subcategoryName: "Skincare",
    attributes: [
      { attributeSlug: "brand", isRequired: true, displayOrder: 1 },
      { attributeSlug: "net-weight", isRequired: true, displayOrder: 2 },
      { attributeSlug: "ingredients", isRequired: true, displayOrder: 3 },
      { attributeSlug: "skin-type", isRequired: false, options: ["Oily", "Dry", "Combination", "Sensitive", "Normal"], displayOrder: 4 },
      { attributeSlug: "expiry-date", isRequired: true, displayOrder: 5 },
    ],
  },
];

const seedCategoriesAndAttributes = async () => {
  try {
    // Wait for database connection
    await dbConnection.authenticate();
    console.log("Database connected successfully.");

    // Initialize models
    Category.initialize(dbConnection);
    Attribute.initialize(dbConnection);
    CategoryAttribute.initialize(dbConnection);

    // Sync database
    await dbConnection.sync();

    // Seed Categories
    console.log("\n=== Seeding Categories ===");
    const categoryMap = new Map<string, string>(); // name -> id
    let createdCategories = 0;
    let skippedCategories = 0;

    for (const categoryData of categories) {
      try {
        // Check if parent category exists
        let existingCategory = await Category.findOne({
          where: { name: categoryData.name },
        });

        let parentCategoryId: string | null = null;

        if (!existingCategory) {
          // Create parent category
          const parentCategory = await Category.create({
            name: categoryData.name,
            description: categoryData.description,
            status: categoryData.status,
            icon: categoryData.icon,
            categoryId: null,
          } as any);
          categoryMap.set(categoryData.name, parentCategory.id);
          parentCategoryId = parentCategory.id;
          console.log(`✓ Created category: ${categoryData.name}`);
          createdCategories++;
        } else {
          parentCategoryId = existingCategory.id;
          categoryMap.set(categoryData.name, existingCategory.id);
          console.log(`Category "${categoryData.name}" already exists, skipping...`);
          skippedCategories++;
        }

        // Create subcategories
        if (categoryData.subcategories && parentCategoryId) {
          for (const subcategoryData of categoryData.subcategories) {
            try {
              const existingSubcategory = await Category.findOne({
                where: {
                  name: subcategoryData.name,
                  categoryId: parentCategoryId,
                },
              });

              if (!existingSubcategory) {
                await Category.create({
                  name: subcategoryData.name,
                  description: subcategoryData.description,
                  status: CategoryStatus.ACTIVE,
                  categoryId: parentCategoryId,
                } as any);
                console.log(`  ✓ Created subcategory: ${subcategoryData.name}`);
                createdCategories++;
              } else {
                console.log(`  Subcategory "${subcategoryData.name}" already exists, skipping...`);
                skippedCategories++;
              }
            } catch (error: any) {
              console.error(`Error creating subcategory "${subcategoryData.name}":`, error.message);
            }
          }
        }
      } catch (error: any) {
        console.error(`Error creating category "${categoryData.name}":`, error.message);
      }
    }

    console.log(`\nCategories - Created: ${createdCategories}, Skipped: ${skippedCategories}`);

    // Seed Attributes
    console.log("\n=== Seeding Attributes ===");
    const attributeMap = new Map<string, string>(); // slug -> id
    let createdAttributes = 0;
    let skippedAttributes = 0;

    for (const attributeData of attributes) {
      try {
        const existingAttribute = await Attribute.findOne({
          where: { slug: attributeData.slug },
        });

        if (existingAttribute) {
          attributeMap.set(attributeData.slug, existingAttribute.id);
          console.log(`Attribute "${attributeData.name}" (${attributeData.slug}) already exists, skipping...`);
          skippedAttributes++;
          continue;
        }

        const attribute = await Attribute.create(attributeData as any);
        attributeMap.set(attributeData.slug, attribute.id);
        console.log(`✓ Created attribute: ${attributeData.name} (${attributeData.slug})`);
        createdAttributes++;
      } catch (error: any) {
        console.error(`Error creating attribute "${attributeData.name}":`, error.message);
      }
    }

    console.log(`\nAttributes - Created: ${createdAttributes}, Skipped: ${skippedAttributes}`);

    // Seed Category-Attribute mappings
    console.log("\n=== Seeding Category-Attribute Mappings ===");
    let createdMappings = 0;
    let skippedMappings = 0;

    for (const mapping of categoryAttributeMappings) {
      try {
        // Find the category (parent or subcategory)
        let category: any = null;
        if (mapping.subcategoryName) {
          // Find subcategory
          const parentCategory = await Category.findOne({
            where: { name: mapping.categoryName },
          });
          if (parentCategory) {
            category = await Category.findOne({
              where: {
                name: mapping.subcategoryName,
                categoryId: parentCategory.id,
              },
            });
          }
        } else {
          // Find parent category
          category = await Category.findOne({
            where: { name: mapping.categoryName },
          });
        }

        if (!category) {
          console.log(`Category "${mapping.categoryName}"${mapping.subcategoryName ? ` > "${mapping.subcategoryName}"` : ""} not found, skipping mappings...`);
          continue;
        }

        for (const attrMapping of mapping.attributes) {
          try {
            const attributeId = attributeMap.get(attrMapping.attributeSlug);
            if (!attributeId) {
              console.log(`Attribute "${attrMapping.attributeSlug}" not found, skipping...`);
              continue;
            }

            // Check if mapping already exists
            const existingMapping = await CategoryAttribute.findOne({
              where: {
                categoryId: category.id,
                attributeId: attributeId,
              },
            });

            if (existingMapping) {
              console.log(`  Mapping already exists for ${category.name} -> ${attrMapping.attributeSlug}, skipping...`);
              skippedMappings++;
              continue;
            }

            await CategoryAttribute.create({
              categoryId: category.id,
              attributeId: attributeId,
              isRequired: attrMapping.isRequired,
              options: attrMapping.options || null,
              displayOrder: attrMapping.displayOrder,
            } as any);

            console.log(`  ✓ Created mapping: ${category.name} -> ${attrMapping.attributeSlug}`);
            createdMappings++;
          } catch (error: any) {
            console.error(`Error creating mapping for ${attrMapping.attributeSlug}:`, error.message);
          }
        }
      } catch (error: any) {
        console.error(`Error processing mappings for "${mapping.categoryName}":`, error.message);
      }
    }

    console.log(`\nCategory-Attribute Mappings - Created: ${createdMappings}, Skipped: ${skippedMappings}`);

    console.log("\n=== Seeding Complete ===");
    console.log(`Total Categories: ${createdCategories + skippedCategories}`);
    console.log(`Total Attributes: ${createdAttributes + skippedAttributes}`);
    console.log(`Total Mappings: ${createdMappings + skippedMappings}`);

    await dbConnection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding categories and attributes:", error);
    await dbConnection.close();
    process.exit(1);
  }
};

// Run the seed function
seedCategoriesAndAttributes();
