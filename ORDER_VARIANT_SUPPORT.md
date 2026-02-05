# Order System with Variant Support

## Overview
The order system now fully supports product variants with proper price handling and detailed order item information including which specific variant was purchased.

## Key Features

### 1. **Variant Price Handling**
Orders correctly handle variant pricing with proper fallback logic:
- Uses variant's `discountPrice` if set
- Falls back to variant's `price` if no discount
- Falls back to product's `regularPrice` if variant has no price
- Ensures correct pricing even when variant prices are optional

### 2. **Variant Information in Orders**
All order fetch operations include:
- Order items with full product details
- Variant information (if applicable)
- Variant attributes: id, name, sku, price, discountPrice, status

### 3. **Complete Order Data**
When fetching orders, you get:
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-123456",
  "items": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "productVariantId": "variant-uuid",
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98,
      "product": {
        "id": "product-uuid",
        "title": "Premium T-Shirt",
        "sku": "TSHIRT-001"
      },
      "variant": {
        "id": "variant-uuid",
        "name": "Medium",
        "sku": "TSHIRT-M",
        "price": 29.99,
        "status": "Active"
      }
    }
  ]
}
```

## Order Creation Flow

### Cart Item → Order Item
When a user checks out:

1. **Cart has items with variants:**
```json
{
  "cartItems": [
    {
      "productId": "product-uuid",
      "productVariantId": "variant-uuid",
      "quantity": 2
    }
  ]
}
```

2. **Order creation process:**
```typescript
// src/services/order/order.service.ts - createOrder()

// Get variant details
const variant = product.variants?.find(v => v.id === cartItem.productVariantId);

// Determine price with fallback logic
let variantPrice;
if (variant.discountPrice) {
  variantPrice = variant.discountPrice;  // Use discount price
} else if (variant.price) {
  variantPrice = variant.price;  // Use variant price
} else {
  // Variant has no price, use product price
  variantPrice = product.regularPrice;
}

// Create order item with variant reference
await orderRepository.createOrderItem(order.id, {
  productId: cartItem.productId,
  productVariantId: cartItem.productVariantId,  // ✅ Stored
  quantity: cartItem.quantity,
  unitPrice: variantPrice,
  totalPrice: variantPrice * cartItem.quantity
});
```

3. **Result - Order item saved with:**
- `productId` - reference to the product
- `productVariantId` - reference to the specific variant purchased
- `unitPrice` - the price at time of purchase (locked in)
- Inventory deducted from the correct variant

## Database Schema

### OrderItem Model
```typescript
{
  id: string;
  orderId: string;
  productId: string;           // ✅ Always set
  productVariantId?: string;   // ✅ Set if variant was purchased
  quantity: number;
  unitPrice: number;           // ✅ Price at time of purchase
  totalPrice: number;
  status: string;
}
```

### Associations
```typescript
// OrderItem belongs to Product
OrderItem.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});

// OrderItem belongs to ProductVariant
OrderItem.belongsTo(ProductVariant, { 
  foreignKey: 'productVariantId', 
  as: 'variant' 
});
```

## API Responses

### Get Order by ID
```bash
GET /api/order/:id
```

**Response:**
```json
{
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-1738761234567",
    "userId": "user-uuid",
    "totalAmount": 89.97,
    "status": "pending",
    "paymentStatus": "paid",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "id": "item-1",
        "productId": "product-1",
        "productVariantId": "variant-small",
        "quantity": 1,
        "unitPrice": 29.99,
        "totalPrice": 29.99,
        "status": "pending",
        "product": {
          "id": "product-1",
          "title": "Cotton T-Shirt",
          "sku": "TSHIRT-001",
          "images": [...]
        },
        "variant": {
          "id": "variant-small",
          "name": "Small",
          "sku": "TSHIRT-S",
          "price": 29.99,
          "status": "Active"
        }
      },
      {
        "id": "item-2",
        "productId": "product-1",
        "productVariantId": "variant-large",
        "quantity": 2,
        "unitPrice": 29.99,
        "totalPrice": 59.98,
        "status": "pending",
        "product": {
          "id": "product-1",
          "title": "Cotton T-Shirt",
          "sku": "TSHIRT-001"
        },
        "variant": {
          "id": "variant-large",
          "name": "Large",
          "sku": "TSHIRT-L",
          "price": 29.99,
          "status": "Active"
        }
      }
    ]
  }
}
```

### Get User Orders
```bash
GET /api/order/user/:userId
```

Returns array of orders with full item and variant details.

### Get Vendor Orders
```bash
GET /api/order/vendor/:vendorId
```

Returns only orders containing items from the vendor's products, with variant information.

## Frontend Integration

### Display Order Item with Variant

```typescript
interface OrderItem {
  id: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    title: string;
    sku: string;
    images: any[];
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    status: string;
  };
}

function OrderItemCard({ item }: { item: OrderItem }) {
  return (
    <div className="order-item">
      <img src={item.product.images[0]?.file} alt={item.product.title} />
      
      <div className="item-details">
        <h3>{item.product.title}</h3>
        
        {/* Show variant if applicable */}
        {item.variant && (
          <p className="variant-name">
            Variant: {item.variant.name}
          </p>
        )}
        
        <p className="sku">
          SKU: {item.variant?.sku || item.product.sku}
        </p>
        
        <p className="quantity">Qty: {item.quantity}</p>
        
        <p className="price">
          ${item.unitPrice.toFixed(2)} × {item.quantity} = 
          ${item.totalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
```

### Order Summary Component

```tsx
function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="order-summary">
      <h2>Order #{order.orderNumber}</h2>
      
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="item-row">
            <span>
              {item.product.title}
              {item.variant && ` - ${item.variant.name}`}
            </span>
            <span>×{item.quantity}</span>
            <span>${item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="order-total">
        <strong>Total:</strong>
        <strong>${order.totalAmount.toFixed(2)}</strong>
      </div>
    </div>
  );
}
```

### Vendor Order Management

```tsx
function VendorOrderItem({ item }: { item: OrderItem }) {
  return (
    <tr>
      <td>{item.product.title}</td>
      <td>{item.variant?.name || 'N/A'}</td>
      <td>{item.variant?.sku || item.product.sku}</td>
      <td>{item.quantity}</td>
      <td>${item.unitPrice.toFixed(2)}</td>
      <td>${item.totalPrice.toFixed(2)}</td>
      <td>
        <span className={`status-${item.status}`}>
          {item.status}
        </span>
      </td>
    </tr>
  );
}
```

## Price Scenarios

### Scenario 1: Variant with Own Price
```json
{
  "product": {
    "regularPrice": 100,
    "variants": [
      { "name": "Premium", "price": 150 }
    ]
  }
}
// Order unitPrice: 150 (variant price)
```

### Scenario 2: Variant with Discount
```json
{
  "product": {
    "regularPrice": 100,
    "variants": [
      { "name": "Small", "price": 100, "discountPrice": 80 }
    ]
  }
}
// Order unitPrice: 80 (variant discount price)
```

### Scenario 3: Variant No Price (Inherits)
```json
{
  "product": {
    "regularPrice": 100,
    "variants": [
      { "name": "Medium", "price": null }
    ]
  }
}
// Order unitPrice: 100 (falls back to product regularPrice)
```

### Scenario 4: Product Without Variants
```json
{
  "product": {
    "regularPrice": 50,
    "variants": []
  }
}
// Order unitPrice: 50 (product regularPrice)
// productVariantId: null
```

## Repository Methods Updated

All these methods now include order items with variant details:

✅ `findById(orderId)` - Get single order  
✅ `findByOrderNumber(orderNumber)` - Get order by order number  
✅ `findByUserId(userId)` - Get user's orders  
✅ `findAll(status?)` - Get all orders (admin)  
✅ `findByVendorId(vendorId, status?)` - Get vendor's orders  

## Helper Method

Created `getOrderIncludes()` helper for consistent includes:
```typescript
private getOrderIncludes(vendorId?: string): any[] {
  return [
    {
      model: User,
      as: "user",
      attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
    },
    {
      model: OrderItem,
      as: "items",
      include: [
        {
          model: Product,
          as: "product",
          ...(vendorId ? { where: { userId: vendorId } } : {}),
        },
        {
          model: ProductVariant,
          as: "variant",
          attributes: ["id", "name", "sku", "price", "discountPrice", "status"],
        },
      ],
    },
  ];
}
```

## Benefits

### 1. **Complete Order History**
- Users can see exactly which variant they ordered
- No ambiguity about "which size did I buy?"

### 2. **Price Accuracy**
- Price at time of purchase is locked in `unitPrice`
- Even if product/variant price changes later, order shows what was paid

### 3. **Inventory Tracking**
- Correct variant's inventory is deducted
- No confusion about which variant to restock

### 4. **Vendor Management**
- Vendors see which variants are selling
- Can track popular sizes/colors
- Better inventory planning

### 5. **Returns & Exchanges**
- Clear which variant to restock on return
- Easy to process exchanges for different variants

## Testing

### Test Order with Variants
```bash
# 1. Add items to cart with variants
POST /api/cart/add
{
  "productId": "product-uuid",
  "productVariantId": "variant-uuid",
  "quantity": 2
}

# 2. Create order
POST /api/order
{
  "shippingAddress": "...",
  "paymentMethod": "payfast"
}

# 3. Verify order includes variant info
GET /api/order/:orderId
# Should show variant details in items array
```

## Summary

✅ **Order items store `productVariantId`**  
✅ **Variant pricing with fallback to product price**  
✅ **All order fetch methods include variant details**  
✅ **Price locked at time of purchase**  
✅ **Inventory deducted from correct variant**  
✅ **Frontend can display which variant was purchased**  
✅ **Vendor orders show variant information**  
✅ **Complete order history with all details**  

**Status:** ✅ COMPLETE - Order system fully supports variants with proper tracking and pricing!
