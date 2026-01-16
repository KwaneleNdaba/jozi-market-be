import "reflect-metadata";
import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "@/config";
import Feature from "@/models/feature/feature.model";

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

const features = [
  {
    name: "Product Listings",
    description: "Allow vendors to list products on the marketplace with images, descriptions, and pricing.",
    slug: "product-listings",
  },
  {
    name: "Product Variants",
    description: "Enable products to have variants such as size, color, or packaging with different prices.",
    slug: "product-variants",
  },
  {
    name: "Inventory Management",
    description: "Allow vendors to manage stock levels, restocking, and availability status.",
    slug: "inventory-management",
  },
  {
    name: "Production Cost Tracking",
    description: "Allow vendors to record production or acquisition cost per product or variant.",
    slug: "production-cost-tracking",
  },
  {
    name: "Vendor Analytics",
    description: "Access to sales, revenue, product performance, and customer insights.",
    slug: "vendor-analytics",
  },
  {
    name: "AI Intelligence",
    description: "AI-driven insights, predictions, recommendations, and performance alerts.",
    slug: "ai-intelligence",
  },
  {
    name: "Marketing Hub",
    description: "Access to promotions, campaigns, discounts, and marketing performance tools.",
    slug: "marketing-hub",
  },
  {
    name: "Social Media Promotion",
    description: "Ability to submit images or videos for promotion on platform-owned social media accounts.",
    slug: "social-media-promotion",
  },
  {
    name: "Platform Selection",
    description: "Allow vendors to choose which social media platforms their content is promoted on.",
    slug: "platform-selection",
  },
  {
    name: "Promotion Slots",
    description: "Limit the number of approved promotional posts per vendor per month.",
    slug: "promotion-slots",
  },
  {
    name: "Promotion Analytics",
    description: "Provide analytics on reach, impressions, engagement, and clicks for vendor content.",
    slug: "promotion-analytics",
  },
  {
    name: "Discount & Coupon Creation",
    description: "Allow vendors to create discount codes or coupons for products or customers.",
    slug: "discount-coupon-creation",
  },
  {
    name: "Customer Targeting",
    description: "Enable targeting of discounts or campaigns to specific customer segments.",
    slug: "customer-targeting",
  },
  {
    name: "Email Campaigns",
    description: "Allow vendors to send promotional or campaign emails to customers.",
    slug: "email-campaigns",
  },
  {
    name: "Loyalty Program Participation",
    description: "Allow vendors to participate in points, rewards, and loyalty-based campaigns.",
    slug: "loyalty-program-participation",
  },
  {
    name: "Points Gifting",
    description: "Allow vendors to gift points to customers in exchange for credits or promotions.",
    slug: "points-gifting",
  },
  {
    name: "Referral Program Participation",
    description: "Enable vendors to benefit from platform referral programs and incentives.",
    slug: "referral-program-participation",
  },
  {
    name: "Featured Placement",
    description: "Ability for vendor products or shops to be featured on homepage or campaigns.",
    slug: "featured-placement",
  },
  {
    name: "Ad Credit Bidding",
    description: "Allow vendors to bid credits for higher visibility or promotional priority.",
    slug: "ad-credit-bidding",
  },
  {
    name: "Customer Insights",
    description: "Visibility into customer behavior such as visits, cart adds, and repeat purchases.",
    slug: "customer-insights",
  },
  {
    name: "Reviews Management",
    description: "Allow vendors to view and respond to customer reviews and ratings.",
    slug: "reviews-management",
  },
  {
    name: "Priority Support",
    description: "Access to faster or dedicated support channels.",
    slug: "priority-support",
  },
  {
    name: "Verified Vendor Badge",
    description: "Display a verification badge after business approval and compliance checks.",
    slug: "verified-vendor-badge",
  },
  {
    name: "Supplier Listing",
    description: "Allow vendors to list their suppliers to help new businesses discover sources.",
    slug: "supplier-listing",
  },
  {
    name: "Early Feature Access",
    description: "Get early access to new tools, AI features, or platform enhancements.",
    slug: "early-feature-access",
  },
];

const seedFeatures = async () => {
  try {
    // Wait for database connection
    await dbConnection.authenticate();
    console.log("Database connected successfully.");

    // Initialize Feature model
    Feature.initialize(dbConnection);

    // Sync database
    await dbConnection.sync();

    let createdCount = 0;
    let skippedCount = 0;

    for (const feature of features) {
      try {
        // Check if feature with this slug already exists
        const existingFeature = await Feature.findOne({
          where: { slug: feature.slug },
        });

        if (existingFeature) {
          console.log(`Feature "${feature.name}" (${feature.slug}) already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create the feature
        await Feature.create(feature as any);
        console.log(`✓ Created feature: ${feature.name} (${feature.slug})`);
        createdCount++;
      } catch (error: any) {
        console.error(`Error creating feature "${feature.name}":`, error.message);
      }
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`Created: ${createdCount} features`);
    console.log(`Skipped: ${skippedCount} features (already exist)`);
    console.log(`Total: ${features.length} features`);

    await dbConnection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding features:", error);
    await dbConnection.close();
    process.exit(1);
  }
};

// Run the seed function
seedFeatures();
