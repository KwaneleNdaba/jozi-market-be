# Type System Updates - Variant Support

## Overview
Updated TypeScript type definitions to properly reflect variant information in orders and cart items.

## Updated Types

### Order Types (`src/types/order.types.ts`)

#### New Interfaces

**IOrderProduct** - Product information in order items
```typescript
export interface IOrderProduct {
  id: string;
  title: string;
  description?: string;
  sku: string;
  images?: Array<{
    index: number;
    file: string;
  }>;
  regularPrice?: number;
  discountPrice?: number;
  status?: string;
}
```

**IOrderProductVariant** - Variant information in order items
```typescript
export interface IOrderProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;          // Optional: may inherit from product
  discountPrice?: number;
  status: string;
}
```

#### Updated Interfaces

**IOrderItem** - Now includes typed product and variant
```typescript
export interface IOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productVariantId?: string | null;  // Reference to variant
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status?: OrderItemStatus | string;
  
  // Enriched data
  product?: IOrderProduct;         // ✅ Typed (was 'any')
  variant?: IOrderProductVariant;  // ✅ NEW: Variant details
  
  // ... other fields
}
```

**IOrderItemWithDetails** - Extended order item with full details
```typescript
export interface IOrderItemWithDetails extends IOrderItem {
  order?: {
    id: string;
    orderNumber: string;
    // ... other order fields
  };
  product?: IOrderProduct;         // ✅ Typed
  variant?: IOrderProductVariant;  // ✅ Typed
  vendor?: IVendorDetails;
}
```

### Cart Types (`src/types/cart.types.ts`)

#### New Interfaces

**ICartProduct** - Product information in cart items
```typescript
export interface ICartProduct {
  id: string;
  title: string;
  description?: string;
  sku: string;
  images?: Array<{
    index: number;
    file: string;
  }>;
  regularPrice?: number;
  discountPrice?: number;
  status?: string;
  variants?: ICartProductVariant[];
}
```

**ICartProductVariant** - Variant information in cart items
```typescript
export interface ICartProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;          // Optional: may inherit from product
  discountPrice?: number;
  stock: number;
  status: string;
}
```

#### Updated Interfaces

**ICartItem** - Now includes typed product and variant
```typescript
export interface ICartItem {
  id?: string;
  cartId?: string;
  productId: string;
  productVariantId?: string | null;  // Reference to variant
  quantity: number;
  
  // Enriched data
  product?: ICartProduct;         // ✅ Typed (was 'any')
  variant?: ICartProductVariant;  // ✅ NEW: Variant details
  
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Type Safety Benefits

### Before (Untyped)
```typescript
// ❌ No type safety
interface IOrderItem {
  product?: any;  // Could be anything
}

// Usage
const productTitle = orderItem.product.title;  // No autocomplete
const variantName = orderItem.product.variant.name;  // Runtime error risk
```

### After (Typed)
```typescript
// ✅ Full type safety
interface IOrderItem {
  product?: IOrderProduct;
  variant?: IOrderProductVariant;
}

// Usage with autocomplete and type checking
const productTitle = orderItem.product?.title;  // ✅ Autocomplete works
const variantName = orderItem.variant?.name;    // ✅ Correct field access
const variantSku = orderItem.variant?.sku;      // ✅ Type-safe
```

## Frontend TypeScript Usage

### Order Item Component
```typescript
import { IOrderItem, IOrderProduct, IOrderProductVariant } from '@/types/order.types';

interface OrderItemCardProps {
  item: IOrderItem;
}

function OrderItemCard({ item }: OrderItemCardProps) {
  // ✅ TypeScript knows all fields
  const product: IOrderProduct | undefined = item.product;
  const variant: IOrderProductVariant | undefined = item.variant;
  
  return (
    <div>
      <h3>{product?.title}</h3>
      
      {/* TypeScript knows variant has 'name' field */}
      {variant && (
        <p>Variant: {variant.name}</p>
      )}
      
      {/* TypeScript knows about optional price */}
      {variant?.price && (
        <p>Price: ${variant.price}</p>
      )}
    </div>
  );
}
```

### Cart Component
```typescript
import { ICartItem, ICartProduct, ICartProductVariant } from '@/types/cart.types';

interface CartItemProps {
  item: ICartItem;
}

function CartItem({ item }: CartItemProps) {
  const product = item.product;
  const variant = item.variant;
  
  // Get effective price with type safety
  const getPrice = (): number => {
    if (variant?.discountPrice) return variant.discountPrice;
    if (variant?.price) return variant.price;
    if (product?.discountPrice) return product.discountPrice;
    return product?.regularPrice ?? 0;
  };
  
  return (
    <div>
      <h3>{product?.title}</h3>
      {variant && <span>({variant.name})</span>}
      <p>Price: ${getPrice().toFixed(2)}</p>
      <p>Qty: {item.quantity}</p>
    </div>
  );
}
```

### Order Summary
```typescript
import { IOrder, IOrderItem } from '@/types/order.types';

interface OrderSummaryProps {
  order: IOrder;
}

function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div>
      <h2>Order #{order.orderNumber}</h2>
      
      {order.items?.map((item: IOrderItem) => (
        <div key={item.id}>
          {/* TypeScript autocomplete for all fields */}
          <span>{item.product?.title}</span>
          {item.variant && <span> - {item.variant.name}</span>}
          <span> × {item.quantity}</span>
          <span> = ${item.totalPrice.toFixed(2)}</span>
        </div>
      ))}
      
      <div>
        <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
      </div>
    </div>
  );
}
```

## API Response Types

### Get Order Response
```typescript
interface GetOrderResponse {
  data: IOrder;  // Fully typed order with items and variants
  message: string;
  error: boolean;
}

// Usage
const response = await fetch('/api/order/123');
const { data: order }: GetOrderResponse = await response.json();

// ✅ TypeScript knows structure
order.items?.forEach(item => {
  console.log(item.product?.title);      // string | undefined
  console.log(item.variant?.name);       // string | undefined
  console.log(item.unitPrice);           // number
});
```

### Get Cart Response
```typescript
interface GetCartResponse {
  data: ICart;  // Fully typed cart with items and variants
  message: string;
  error: boolean;
}

// Usage
const response = await fetch('/api/cart');
const { data: cart }: GetCartResponse = await response.json();

// ✅ TypeScript knows structure
cart.items?.forEach(item => {
  console.log(item.product?.title);      // string | undefined
  console.log(item.variant?.name);       // string | undefined
  console.log(item.productVariantId);    // string | null | undefined
});
```

## Validation Examples

### Type Guards
```typescript
function hasVariant(item: IOrderItem): item is IOrderItem & { variant: IOrderProductVariant } {
  return !!item.variant;
}

function processOrderItems(items: IOrderItem[]) {
  items.forEach(item => {
    if (hasVariant(item)) {
      // TypeScript knows variant exists here
      console.log(`Variant: ${item.variant.name}`);
      console.log(`SKU: ${item.variant.sku}`);
    } else {
      // No variant, use product info
      console.log(`Product: ${item.product?.title}`);
    }
  });
}
```

### Price Calculation with Types
```typescript
function calculateItemPrice(item: IOrderItem): number {
  // Using the stored unitPrice (price at time of purchase)
  return item.unitPrice * item.quantity;
}

function getDisplayPrice(item: ICartItem): number {
  const variant = item.variant;
  const product = item.product;
  
  // Type-safe price resolution
  if (variant?.discountPrice !== undefined && variant.discountPrice !== null) {
    return variant.discountPrice;
  }
  
  if (variant?.price !== undefined && variant.price !== null) {
    return variant.price;
  }
  
  if (product?.discountPrice !== undefined && product.discountPrice !== null) {
    return product.discountPrice;
  }
  
  return product?.regularPrice ?? 0;
}
```

## Benefits Summary

### 1. **Type Safety**
- No more `any` types
- Compile-time error checking
- Prevents runtime errors

### 2. **IDE Support**
- Autocomplete for all fields
- Inline documentation
- Refactoring support

### 3. **Code Quality**
- Self-documenting code
- Easier to understand structure
- Catches bugs early

### 4. **Developer Experience**
- Faster development
- Fewer bugs
- Better maintainability

### 5. **API Contract**
- Clear expectations
- Frontend/Backend alignment
- Documentation built-in

## Migration Guide

### For Existing Code

**Before:**
```typescript
// Untyped access
const title = orderItem.product.title;
const variantName = orderItem.product.variant.name;  // Wrong!
```

**After:**
```typescript
// Properly typed access
const title = orderItem.product?.title;
const variantName = orderItem.variant?.name;  // Correct!
```

### Type Imports

**Order Types:**
```typescript
import {
  IOrder,
  IOrderItem,
  IOrderProduct,
  IOrderProductVariant,
  IOrderItemWithDetails,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus
} from '@/types/order.types';
```

**Cart Types:**
```typescript
import {
  ICart,
  ICartItem,
  ICartProduct,
  ICartProductVariant,
  IAddToCart,
  IUpdateCartItem
} from '@/types/cart.types';
```

## Files Modified

✅ `src/types/order.types.ts` - Added IOrderProduct, IOrderProductVariant  
✅ `src/types/cart.types.ts` - Added ICartProduct, ICartProductVariant  

## Summary

✅ **All `any` types replaced with proper interfaces**  
✅ **Variant information properly typed**  
✅ **Full TypeScript support for frontend**  
✅ **Type-safe API responses**  
✅ **Better IDE autocomplete**  
✅ **Compile-time error checking**  
✅ **Self-documenting code**  

**Status:** ✅ COMPLETE - Type system fully supports variants with proper type safety!
