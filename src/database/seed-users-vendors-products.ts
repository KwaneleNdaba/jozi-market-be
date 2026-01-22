import "reflect-metadata";
import { Sequelize } from "sequelize";
import { hash } from "bcryptjs";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "@/config";
import User from "@/models/user/user.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import Product from "@/models/product/product.model";
import Category from "@/models/category/category.model";
import { VendorApplicationStatus, VendorType } from "@/types/vendor.types";
import { IProductImage } from "@/types/product.types";
import { uploadFileToS3 } from "@/utils/s3";

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

// Initialize models
User.initialize(dbConnection);
VendorApplication.initialize(dbConnection);
Product.initialize(dbConnection);
Category.initialize(dbConnection);

// Helper function to download image and upload to S3
async function downloadAndUploadImage(
  imageUrl: string,
  fileName: string
): Promise<string> {
  try {
    const tempDir = path.join(process.cwd(), "temp-images");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, fileName);
    
    // Download image using https/http with redirect handling
    const url = new URL(imageUrl);
    const client = url.protocol === "https:" ? https : http;
    
    await new Promise<void>((resolve, reject) => {
      const downloadFile = (urlToDownload: string, maxRedirects = 5) => {
        if (maxRedirects <= 0) {
          reject(new Error("Too many redirects"));
          return;
        }

        const file = fs.createWriteStream(tempPath);
        const requestUrl = new URL(urlToDownload);
        const requestClient = requestUrl.protocol === "https:" ? https : http;
        
        const options = {
          hostname: requestUrl.hostname,
          port: requestUrl.port || (requestUrl.protocol === "https:" ? 443 : 80),
          path: requestUrl.pathname + requestUrl.search,
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; SeedBot/1.0)",
          },
        };

        const req = requestClient.request(options, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            const redirectUrl = response.headers.location;
            if (!redirectUrl) {
              reject(new Error("Redirect location not found"));
              return;
            }
            // Resolve relative URLs
            const absoluteRedirectUrl = redirectUrl.startsWith("http") 
              ? redirectUrl 
              : new URL(redirectUrl, urlToDownload).toString();
            file.close();
            if (fs.existsSync(tempPath)) {
              fs.unlinkSync(tempPath);
            }
            downloadFile(absoluteRedirectUrl, maxRedirects - 1);
            return;
          }

          if (response.statusCode !== 200) {
            file.close();
            reject(new Error(`Failed to download image: ${response.statusCode}`));
            return;
          }

          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
          file.on("error", (err) => {
            file.close();
            reject(err);
          });
        });

        req.on("error", reject);
        req.end();
      };

      downloadFile(imageUrl);
    });

    // Verify file was downloaded
    if (!fs.existsSync(tempPath)) {
      throw new Error("File was not downloaded");
    }

    const stats = fs.statSync(tempPath);
    if (stats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    // Upload to S3
    const s3Url = await uploadFileToS3(tempPath, fileName, "image/jpeg");
    
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return s3Url;
  } catch (error) {
    console.error(`Error downloading/uploading image ${fileName}:`, error);
    // Clean up temp file if it exists
    const tempPath = path.join(process.cwd(), "temp-images", fileName);
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    // Return placeholder URL if upload fails
    return imageUrl;
  }
}

// Customer data
const customers = [
  {
    fullName: "John Smith",
    email: "john.smith@example.com",
    password: "Customer123!",
    phone: "+27123456789",
    role: "customer",
    address: "123 Main Street, Johannesburg, 2000",
  },
  {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    password: "Customer123!",
    phone: "+27123456790",
    role: "customer",
    address: "456 Oak Avenue, Cape Town, 8001",
  },
  {
    fullName: "Michael Brown",
    email: "michael.brown@example.com",
    password: "Customer123!",
    phone: "+27123456791",
    role: "customer",
    address: "789 Pine Road, Durban, 4001",
  },
  {
    fullName: "Emily Davis",
    email: "emily.davis@example.com",
    password: "Customer123!",
    phone: "+27123456792",
    role: "customer",
    address: "321 Elm Street, Pretoria, 0001",
  },
  {
    fullName: "David Wilson",
    email: "david.wilson@example.com",
    password: "Customer123!",
    phone: "+27123456793",
    role: "customer",
    address: "654 Maple Drive, Port Elizabeth, 6001",
  },
];

// Vendor data
const vendors = [
  {
    fullName: "Artisan Crafts Co",
    email: "vendor1@artisancrafts.com",
    password: "Vendor123!",
    phone: "+27987654321",
    role: "vendor",
    address: "100 Craft Street, Johannesburg, 2000",
    shopName: "Artisan Crafts Co",
    legalName: "Artisan Crafts Company (Pty) Ltd",
    contactPerson: "Jane Artisan",
    vendorType: VendorType.BUSINESS,
    description: "Handcrafted artisanal products made with love and care. We specialize in unique home decor and gift items.",
    website: "https://artisancrafts.co.za",
    tagline: "Handcrafted with Passion",
    vatNumber: "VAT123456789",
    productCount: "50-100",
    fulfillment: "Self-fulfilled",
    cipcNumber: "2024/123456/07",
  },
  {
    fullName: "Eco Living Store",
    email: "vendor2@ecoliving.com",
    password: "Vendor123!",
    phone: "+27987654322",
    role: "vendor",
    address: "200 Green Avenue, Cape Town, 8001",
    shopName: "Eco Living Store",
    legalName: "Eco Living Store CC",
    contactPerson: "Mark Green",
    vendorType: VendorType.BUSINESS,
    description: "Sustainable and eco-friendly products for conscious living. From organic skincare to reusable household items.",
    website: "https://ecoliving.co.za",
    tagline: "Sustainable Living Made Easy",
    vatNumber: "VAT234567890",
    productCount: "25-50",
    fulfillment: "Self-fulfilled",
    cipcNumber: null,
  },
  {
    fullName: "Tech Gadgets Pro",
    email: "vendor3@techgadgets.com",
    password: "Vendor123!",
    phone: "+27987654323",
    role: "vendor",
    address: "300 Tech Boulevard, Durban, 4001",
    shopName: "Tech Gadgets Pro",
    legalName: "Tech Gadgets Professional",
    contactPerson: "Lisa Tech",
    vendorType: VendorType.INDIVIDUAL,
    description: "Latest tech gadgets and accessories. We bring you the best in technology at competitive prices.",
    website: "https://techgadgets.co.za",
    tagline: "Tech for Everyone",
    vatNumber: "VAT345678901",
    productCount: "100+",
    fulfillment: "Dropshipping",
    cipcNumber: null,
  },
  {
    fullName: "Fashion Forward",
    email: "vendor4@fashionforward.com",
    password: "Vendor123!",
    phone: "+27987654324",
    role: "vendor",
    address: "400 Style Street, Pretoria, 0001",
    shopName: "Fashion Forward",
    legalName: "Fashion Forward (Pty) Ltd",
    contactPerson: "Anna Fashion",
    vendorType: VendorType.BUSINESS,
    description: "Trendy and affordable fashion for the modern individual. From casual wear to formal attire.",
    website: "https://fashionforward.co.za",
    tagline: "Style That Speaks",
    vatNumber: "VAT456789012",
    productCount: "50-100",
    fulfillment: "Self-fulfilled",
    cipcNumber: "2024/234567/07",
  },
  {
    fullName: "Home & Garden Essentials",
    email: "vendor5@homegarden.com",
    password: "Vendor123!",
    phone: "+27987654325",
    role: "vendor",
    address: "500 Garden Lane, Port Elizabeth, 6001",
    shopName: "Home & Garden Essentials",
    legalName: "Home & Garden Essentials CC",
    contactPerson: "Tom Garden",
    vendorType: VendorType.BUSINESS,
    description: "Everything you need for your home and garden. Quality products for comfortable living.",
    website: "https://homegarden.co.za",
    tagline: "Your Home, Our Passion",
    vatNumber: "VAT567890123",
    productCount: "25-50",
    fulfillment: "Self-fulfilled",
    cipcNumber: null,
  },
];

// Product data templates (5 products per vendor)
const productTemplates = [
  {
    title: "Handcrafted Ceramic Vase",
    description: "Beautiful handcrafted ceramic vase perfect for home decoration. Made with traditional techniques and modern design.",
    sku: "HCV-001",
    regularPrice: 450.00,
    discountPrice: 380.00,
    initialStock: 25,
    careGuidelines: "Hand wash only. Avoid extreme temperatures.",
    packagingNarrative: "Carefully wrapped in bubble wrap and placed in a sturdy box.",
    artisanNotes: { material: "Ceramic", origin: "Local artisan", technique: "Hand-thrown" },
  },
  {
    title: "Organic Cotton Throw Blanket",
    description: "Luxurious organic cotton throw blanket. Soft, warm, and eco-friendly. Perfect for cozy evenings.",
    sku: "OCT-002",
    regularPrice: 320.00,
    discountPrice: 280.00,
    initialStock: 30,
    careGuidelines: "Machine wash cold. Tumble dry low.",
    packagingNarrative: "Folded and wrapped in eco-friendly packaging.",
    artisanNotes: { material: "Organic Cotton", origin: "Sustainable farm", technique: "Hand-woven" },
  },
  {
    title: "Wireless Bluetooth Earbuds",
    description: "Premium wireless earbuds with noise cancellation. Long battery life and crystal clear sound quality.",
    sku: "WBE-003",
    regularPrice: 899.00,
    discountPrice: 750.00,
    initialStock: 50,
    careGuidelines: "Keep dry. Clean with soft cloth.",
    packagingNarrative: "Sealed in original packaging with charging case.",
    artisanNotes: { material: "Plastic, Metal", origin: "Manufactured", technique: "Electronic" },
  },
  {
    title: "Designer Leather Handbag",
    description: "Elegant designer handbag made from genuine leather. Spacious interior with multiple compartments.",
    sku: "DLH-004",
    regularPrice: 1200.00,
    discountPrice: 999.00,
    initialStock: 15,
    careGuidelines: "Clean with leather conditioner. Store in dust bag.",
    packagingNarrative: "Wrapped in protective cover and placed in branded box.",
    artisanNotes: { material: "Genuine Leather", origin: "Local tannery", technique: "Handcrafted" },
  },
  {
    title: "Garden Tool Set Premium",
    description: "Complete garden tool set with ergonomic handles. Includes trowel, pruner, weeder, and more.",
    sku: "GTS-005",
    regularPrice: 550.00,
    discountPrice: 450.00,
    initialStock: 20,
    careGuidelines: "Clean after use. Store in dry place.",
    packagingNarrative: "Tools secured in durable carrying case.",
    artisanNotes: { material: "Stainless Steel, Wood", origin: "Manufactured", technique: "Precision crafted" },
  },
];

// Login credentials storage
const loginCredentials: Array<{
  email: string;
  password: string;
  role: string;
  shopName?: string;
}> = [];

async function seedDatabase() {
  try {
    await dbConnection.authenticate();
    console.log("✅ Database connection established.");

    // Get a category for products (use first active category)
    const category = await Category.findOne({
      where: { status: "Active" },
    });

    if (!category) {
      throw new Error("No active category found. Please run category seed first.");
    }

    // Get subcategories
    const subcategories = await Category.findAll({
      where: { categoryId: category.id },
      limit: 5,
    });

    console.log("\n📦 Creating customers...");
    const createdCustomers = [];
    for (const customerData of customers) {
      const existingUser = await User.findOne({
        where: { email: customerData.email },
      });

      if (existingUser) {
        console.log(`⏭️  Customer ${customerData.email} already exists, skipping...`);
        createdCustomers.push(existingUser);
        continue;
      }

      const hashedPassword = await hash(customerData.password, 10);
      const customer = await User.create({
        ...customerData,
        password: hashedPassword,
        isEmailConfirmed: true,
        isPhoneConfirmed: true,
        isStoreActive: false,
        provider_user_id: null,
        provider_type: null,
        profileUrl: null,
      } as any);

      loginCredentials.push({
        email: customerData.email,
        password: customerData.password,
        role: "customer",
      });

      createdCustomers.push(customer);
      console.log(`✅ Created customer: ${customerData.fullName} (${customerData.email})`);
    }

    console.log("\n🏪 Creating vendors...");
    const createdVendors = [];
    for (let i = 0; i < vendors.length; i++) {
      const vendorData = vendors[i];
      const existingUser = await User.findOne({
        where: { email: vendorData.email },
      });

      let vendorUser;
      if (existingUser) {
        console.log(`⏭️  Vendor ${vendorData.email} already exists, skipping user creation...`);
        vendorUser = existingUser;
      } else {
        const hashedPassword = await hash(vendorData.password, 10);
        vendorUser = await User.create({
          fullName: vendorData.fullName,
          email: vendorData.email,
          password: hashedPassword,
          phone: vendorData.phone,
          role: vendorData.role,
          address: vendorData.address,
          isEmailConfirmed: true,
          isPhoneConfirmed: true,
          isStoreActive: true, // Activate stores
          provider_user_id: null,
          provider_type: null,
          profileUrl: null,
        } as any);

        loginCredentials.push({
          email: vendorData.email,
          password: vendorData.password,
          role: "vendor",
          shopName: vendorData.shopName,
        });
      }

      // Create vendor application
      const existingApp = await VendorApplication.findOne({
        where: { userId: vendorUser.id },
      });

      if (existingApp) {
        console.log(`⏭️  Vendor application for ${vendorData.shopName} already exists, skipping...`);
        createdVendors.push({ user: vendorUser, application: existingApp });
        continue;
      }

      // Download and upload vendor logo
      const logoFileName = `vendor-logo-${i + 1}-${Date.now()}.jpg`;
      // Use more reliable image sources
      const imageSources = [
        `https://picsum.photos/seed/${i + 1}/400/400`,
        `https://picsum.photos/400/400?random=${Date.now() + i}`,
        `https://dummyimage.com/400x400/0066CC/FFFFFF.png&text=${encodeURIComponent(vendorData.shopName.substring(0, 10))}`,
      ];
      const logoUrl = imageSources[0]; // Use most reliable source first
      let uploadedLogoUrl = logoUrl;
      let uploadSuccess = false;
      
      for (const sourceUrl of imageSources) {
        try {
          const uploadedUrl = await downloadAndUploadImage(sourceUrl, logoFileName);
          // Verify it's an S3 URL (not the original URL)
          if (uploadedUrl.includes("s3") || uploadedUrl.includes("amazonaws")) {
            // Extract S3 key from URL
            const urlWithoutQuery = uploadedUrl.split('?')[0];
            const urlParts = urlWithoutQuery.split('/');
            const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
            uploadedLogoUrl = keyIndex !== -1 
              ? urlParts.slice(keyIndex).join('/')
              : `jozi-makert-files/${logoFileName}`;
            uploadSuccess = true;
            console.log(`📸 Uploaded vendor logo for ${vendorData.shopName}`);
            break;
          }
        } catch (error) {
          // Try next source
          continue;
        }
      }
      
      if (!uploadSuccess) {
        console.warn(`⚠️  Could not upload logo for ${vendorData.shopName}, using placeholder key`);
        uploadedLogoUrl = `jozi-makert-files/placeholder-logo-${i + 1}.jpg`;
      }

      const vendorApp = await VendorApplication.create({
        userId: vendorUser.id,
        status: VendorApplicationStatus.APPROVED,
        submittedAt: new Date(),
        vendorType: vendorData.vendorType,
        legalName: vendorData.legalName,
        shopName: vendorData.shopName,
        contactPerson: vendorData.contactPerson,
        email: vendorData.email,
        phone: vendorData.phone,
        description: vendorData.description,
        website: vendorData.website,
        tagline: vendorData.tagline,
        cipcNumber: vendorData.cipcNumber,
        vatNumber: vendorData.vatNumber,
        productCount: vendorData.productCount,
        fulfillment: vendorData.fulfillment,
        address: {
          street: vendorData.address.split(",")[0],
          city: vendorData.address.split(",")[1]?.trim() || "Johannesburg",
          postal: vendorData.address.split(",")[2]?.trim() || "2000",
          country: "South Africa",
        },
        deliveryRegions: ["Gauteng", "Western Cape", "KwaZulu-Natal"],
        files: {
          logoUrl: uploadedLogoUrl,
          bannerUrl: uploadedLogoUrl, // Using same logo as banner for simplicity
        },
        agreements: {
          terms: true,
          privacy: true,
          popia: true,
          policies: true,
        },
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      } as any);

      createdVendors.push({ user: vendorUser, application: vendorApp });
      console.log(`✅ Created vendor: ${vendorData.shopName} (${vendorData.email})`);
    }

    console.log("\n🛍️  Creating products...");
    let productCount = 0;
    for (let vendorIndex = 0; vendorIndex < createdVendors.length; vendorIndex++) {
      const { user: vendorUser, application: vendorApp } = createdVendors[vendorIndex];
      const subcategory = subcategories[vendorIndex % subcategories.length] || category;

      for (let productIndex = 0; productIndex < productTemplates.length; productIndex++) {
        const template = productTemplates[productIndex];
        const productNumber = vendorIndex * 5 + productIndex + 1;
        const sku = `${template.sku}-V${vendorIndex + 1}`;

        // Check if product with this SKU already exists
        const existingProduct = await Product.findOne({
          where: { sku },
        });

        if (existingProduct) {
          console.log(`⏭️  Product with SKU ${sku} already exists, skipping...`);
          productCount++;
          continue;
        }

        // Download and upload product images
        const imageUrls: IProductImage[] = [];
        
        for (let imgIndex = 0; imgIndex < 3; imgIndex++) {
          const imageFileName = `product-${productNumber}-img-${imgIndex + 1}-${Date.now()}.jpg`;
          // Use different image sources for variety
          const timestamp = Date.now();
          const imageSources = [
            `https://picsum.photos/seed/${productNumber}${imgIndex}/800/800`,
            `https://picsum.photos/800/800?random=${timestamp + productNumber + imgIndex}`,
            `https://dummyimage.com/800x800/FF6B6B/FFFFFF.png&text=Product+${productNumber}`,
          ];
          
          let uploadSuccess = false;
          
          for (const sourceUrl of imageSources) {
            try {
              const uploadedUrl = await downloadAndUploadImage(sourceUrl, imageFileName);
              // Verify it's an S3 URL (not the original URL)
              if (uploadedUrl.includes("s3") || uploadedUrl.includes("amazonaws")) {
                // Extract S3 key from URL
                // Format: https://bucket.s3.region.amazonaws.com/jozi-makert-files/filename
                const urlWithoutQuery = uploadedUrl.split('?')[0];
                const urlParts = urlWithoutQuery.split('/');
                const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
                const s3Key = keyIndex !== -1 
                  ? urlParts.slice(keyIndex).join('/')
                  : `jozi-makert-files/${imageFileName}`;
                
                imageUrls.push({
                  file: s3Key,
                  index: imgIndex,
                });
                uploadSuccess = true;
                console.log(`📸 Uploaded product image ${imgIndex + 1} for product ${productNumber}`);
                break;
              }
            } catch (error) {
              // Try next source
              continue;
            }
          }
          
          if (!uploadSuccess) {
            // Use a simple placeholder if all sources fail
            const placeholderKey = `jozi-makert-files/placeholder-${productNumber}-${imgIndex}.jpg`;
            console.warn(`⚠️  Could not upload image ${imgIndex + 1} for product ${productNumber}, using placeholder key`);
            imageUrls.push({
              file: placeholderKey,
              index: imgIndex,
            });
          }
        }

        const product = await Product.create({
          userId: vendorUser.id,
          title: `${template.title} - ${vendorApp.shopName}`,
          description: template.description,
          sku: `${template.sku}-V${vendorIndex + 1}`,
          status: "Active",
          artisanNotes: template.artisanNotes,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          regularPrice: template.regularPrice,
          discountPrice: template.discountPrice,
          initialStock: template.initialStock,
          careGuidelines: template.careGuidelines,
          packagingNarrative: template.packagingNarrative,
          images: imageUrls,
          video: null,
        } as any);

        productCount++;
        console.log(`✅ Created product ${productCount}/25: ${product.title}`);
      }
    }

    // Clean up temp directory
    const tempDir = path.join(process.cwd(), "temp-images");
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 LOGIN CREDENTIALS");
    console.log("=".repeat(60));
    console.log("\n👥 CUSTOMERS:");
    loginCredentials
      .filter((c) => c.role === "customer")
      .forEach((cred) => {
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
        console.log("");
      });

    console.log("\n🏪 VENDORS:");
    loginCredentials
      .filter((c) => c.role === "vendor")
      .forEach((cred) => {
        console.log(`   Shop: ${cred.shopName}`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
        console.log("");
      });

    console.log("=".repeat(60));
    console.log("\n✅ Seed completed successfully!");
    console.log(`   - ${createdCustomers.length} customers created`);
    console.log(`   - ${createdVendors.length} vendors created`);
    console.log(`   - ${productCount} products created`);
    console.log("\n");

    await dbConnection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await dbConnection.close();
    process.exit(1);
  }
}

// Run seed
seedDatabase();
