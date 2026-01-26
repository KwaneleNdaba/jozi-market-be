import "reflect-metadata";
import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "@/config";
import { SubscriptionPlanStatus, SubscriptionDuration } from "@/types/subscription.types";
import SubscriptionPlan from "@/models/subscription-plan/subscriptionPlan.model";

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
  logging: false,
});

const plans = [
  {
    name: "Free Trial",
    subtitle: "Start selling with zero risk",
    description: `Perfect for new vendors testing Jozi Market.
Sell online with no subscription fees and reduced commission during your first months.

• Unlimited product listings
• Vendor dashboard & basic analytics
• Order & inventory management
• Customer chat access
• Community & email support
• 0% commission for first 30 days
• 5% commission from month 2–6

No upfront costs. No pressure. Just sell.`,
    price: 0.0,
    duration: SubscriptionDuration.MONTHLY,
    status: SubscriptionPlanStatus.ACTIVE,
    isDark: false,
    isStar: false,
  },
  {
    name: "Starter",
    subtitle: "For growing local businesses",
    description: `Ideal for vendors ready to grow consistently online.

• Unlimited product listings
• Detailed sales & revenue reports
• Inventory & order management
• Customer reviews & ratings management
• Voucher & discount creation
• Standard support (24–48h response)
• Access to vendor promotions & campaigns

Commission: 7% per successful order`,
    price: 299.0,
    duration: SubscriptionDuration.MONTHLY,
    status: SubscriptionPlanStatus.ACTIVE,
    isDark: false,
    isStar: false,
  },
  {
    name: "Growth",
    subtitle: "Scale faster with smart tools",
    description: `Built for high-performing vendors ready to scale their brand.

• Everything in Starter
• Advanced analytics & performance insights
• AI-powered product & pricing suggestions
• Featured store placement opportunities
• Referral campaign access
• Video product uploads (TikTok-style)
• Priority support (within 4h)
• Access to influencer & marketing tools

Commission: 5% per successful order`,
    price: 699.0,
    duration: SubscriptionDuration.MONTHLY,
    status: SubscriptionPlanStatus.ACTIVE,
    isDark: true,
    isStar: true,
  },
  {
    name: "Pro / Brand",
    subtitle: "Maximum exposure & VIP support",
    description: `Designed for established brands that want full control and premium exposure.

• Everything in Growth
• Homepage & campaign feature slots
• Sponsored video & banner ads
• Custom store branding
• Early & faster payout cycles
• Advanced marketing & customer insights
• Dedicated account manager
• Priority onboarding for new features

Commission: 3% per successful order`,
    price: 1499.0,
    duration: SubscriptionDuration.MONTHLY,
    status: SubscriptionPlanStatus.ACTIVE,
    isDark: true,
    isStar: false,
  },
];

const seedSubscriptionPlans = async () => {
  try {
    await dbConnection.authenticate();
    console.log("Database connected successfully.");

    // Initialize model
    SubscriptionPlan.initialize(dbConnection);

    // Sync
    await dbConnection.sync();

    let createdCount = 0;
    let skippedCount = 0;

    for (const plan of plans) {
      try {
        const existingPlan = await SubscriptionPlan.findOne({
          where: { name: plan.name },
        });

        if (existingPlan) {
          console.log(`Plan "${plan.name}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        await SubscriptionPlan.create(plan as any);
        console.log(`✓ Created plan: ${plan.name}`);
        createdCount++;
      } catch (error: any) {
        console.error(`Error creating plan "${plan.name}":`, error.message);
      }
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`Created: ${createdCount} plans`);
    console.log(`Skipped: ${skippedCount} plans`);
    console.log(`Total: ${plans.length} plans`);

    await dbConnection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding subscription plans:", error);
    await dbConnection.close();
    process.exit(1);
  }
};

// Run seed
seedSubscriptionPlans();
