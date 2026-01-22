import RefreshToken from "@/models/user/refreshToken.model";
import User from "@/models/user/user.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import Category from "@/models/category/category.model";
import Attribute from "@/models/attribute/attribute.model";
import CategoryAttribute from "@/models/category-attribute/categoryAttribute.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import ProductAttributeValue from "@/models/product-attribute-value/productAttributeValue.model";
import SubscriptionPlan from "@/models/subscription-plan/subscriptionPlan.model";
import Feature from "@/models/feature/feature.model";
import SubscriptionFeature from "@/models/subscription-feature/subscriptionFeature.model";
import UserSubscription from "@/models/user-subscription/userSubscription.model";
import SubscriptionTransaction from "@/models/subscription-transaction/subscriptionTransaction.model";
import Cart from "@/models/cart/cart.model";
import CartItem from "@/models/cart-item/cartItem.model";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";

export function setupAssociations() {
  // User - RefreshToken
  RefreshToken.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });

  // User - VendorApplication
  VendorApplication.belongsTo(User, {
    foreignKey: "userId",
    onDelete: "SET NULL",
    as: "applicant",
  });
  User.hasMany(VendorApplication, { 
    foreignKey: "userId", 
    onDelete: "SET NULL",
    as: "applicant",
  });

  // User - VendorApplication (reviewer)
  VendorApplication.belongsTo(User, {
    foreignKey: "reviewedBy",
    onDelete: "SET NULL",
    as: "reviewer",
  });
  User.hasMany(VendorApplication, { foreignKey: "reviewedBy", onDelete: "SET NULL" });

  // User - Product relationship
  Product.belongsTo(User, {
    foreignKey: "userId",
    as: "vendor",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasMany(Product, {
    foreignKey: "userId",
    as: "products",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Category - Category (self-referencing for parent-child relationship)
  Category.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "parent",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Category.hasMany(Category, {
    foreignKey: "categoryId",
    as: "subcategories",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Category - CategoryAttribute - Attribute relationships
  CategoryAttribute.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Category.hasMany(CategoryAttribute, {
    foreignKey: "categoryId",
    as: "attributes",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  CategoryAttribute.belongsTo(Attribute, {
    foreignKey: "attributeId",
    as: "attribute",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Attribute.hasMany(CategoryAttribute, {
    foreignKey: "attributeId",
    as: "categoryAttributes",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Product - Category relationships
  Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });
  Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  Product.belongsTo(Category, {
    foreignKey: "subcategoryId",
    as: "subcategory",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Category.hasMany(Product, {
    foreignKey: "subcategoryId",
    as: "subcategoryProducts",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Product - ProductVariant relationship
  ProductVariant.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(ProductVariant, {
    foreignKey: "productId",
    as: "variants",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ProductAttributeValue - Product relationship
  ProductAttributeValue.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(ProductAttributeValue, {
    foreignKey: "productId",
    as: "attributeValues",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ProductAttributeValue - Attribute relationship
  ProductAttributeValue.belongsTo(Attribute, {
    foreignKey: "attributeId",
    as: "attribute",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Attribute.hasMany(ProductAttributeValue, {
    foreignKey: "attributeId",
    as: "productValues",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // User - UserSubscription relationship
  UserSubscription.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasMany(UserSubscription, {
    foreignKey: "userId",
    as: "subscriptions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // SubscriptionPlan - UserSubscription relationship
  UserSubscription.belongsTo(SubscriptionPlan, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptionPlan",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });
  SubscriptionPlan.hasMany(UserSubscription, {
    foreignKey: "subscriptionPlanId",
    as: "userSubscriptions",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  // SubscriptionPlan - SubscriptionFeature relationship
  SubscriptionFeature.belongsTo(SubscriptionPlan, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptionPlan",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  SubscriptionPlan.hasMany(SubscriptionFeature, {
    foreignKey: "subscriptionPlanId",
    as: "features",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Feature - SubscriptionFeature relationship
  SubscriptionFeature.belongsTo(Feature, {
    foreignKey: "featureId",
    as: "feature",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Feature.hasMany(SubscriptionFeature, {
    foreignKey: "featureId",
    as: "subscriptionFeatures",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // User - SubscriptionTransaction relationship
  SubscriptionTransaction.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasMany(SubscriptionTransaction, {
    foreignKey: "userId",
    as: "subscriptionTransactions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // SubscriptionPlan - SubscriptionTransaction relationship
  SubscriptionTransaction.belongsTo(SubscriptionPlan, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptionPlan",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });
  SubscriptionPlan.hasMany(SubscriptionTransaction, {
    foreignKey: "subscriptionPlanId",
    as: "transactions",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  // UserSubscription - SubscriptionTransaction relationship
  SubscriptionTransaction.belongsTo(UserSubscription, {
    foreignKey: "userSubscriptionId",
    as: "userSubscription",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  UserSubscription.hasMany(SubscriptionTransaction, {
    foreignKey: "userSubscriptionId",
    as: "transactions",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // User - Cart relationship
  Cart.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasOne(Cart, {
    foreignKey: "userId",
    as: "cart",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Cart - CartItem relationship
  CartItem.belongsTo(Cart, {
    foreignKey: "cartId",
    as: "cart",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Cart.hasMany(CartItem, {
    foreignKey: "cartId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Product - CartItem relationship
  CartItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(CartItem, {
    foreignKey: "productId",
    as: "cartItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ProductVariant - CartItem relationship
  CartItem.belongsTo(ProductVariant, {
    foreignKey: "productVariantId",
    as: "variant",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  ProductVariant.hasMany(CartItem, {
    foreignKey: "productVariantId",
    as: "cartItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // User - Order relationship
  Order.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Order - OrderItem relationship
  OrderItem.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Product - OrderItem relationship
  OrderItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(OrderItem, {
    foreignKey: "productId",
    as: "orderItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ProductVariant - OrderItem relationship
  OrderItem.belongsTo(ProductVariant, {
    foreignKey: "productVariantId",
    as: "variant",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  ProductVariant.hasMany(OrderItem, {
    foreignKey: "productVariantId",
    as: "orderItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Order - User (return reviewer) relationship
  Order.belongsTo(User, {
    foreignKey: "returnReviewedBy",
    as: "returnReviewer",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  User.hasMany(Order, {
    foreignKey: "returnReviewedBy",
    as: "returnReviewedOrders",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Order - User (cancellation reviewer) relationship
  Order.belongsTo(User, {
    foreignKey: "cancellationReviewedBy",
    as: "cancellationReviewer",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  User.hasMany(Order, {
    foreignKey: "cancellationReviewedBy",
    as: "cancellationReviewedOrders",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // OrderItem - User (return reviewer) relationship
  OrderItem.belongsTo(User, {
    foreignKey: "returnReviewedBy",
    as: "returnReviewer",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  User.hasMany(OrderItem, {
    foreignKey: "returnReviewedBy",
    as: "itemReturnReviewedOrders",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
}
