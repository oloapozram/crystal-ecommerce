# Order Management System Design

**Date:** 2025-12-06
**Status:** Approved - Ready for Implementation

## Overview

Standard order management system for Crystal E-Commerce platform with database persistence, status tracking, and admin interface.

## Requirements

### Functional Requirements
- ✅ Save orders to database when checkout completes
- ✅ Order status tracking (6 states)
- ✅ Admin order list with filtering and search
- ✅ Admin order detail view and status updates
- ✅ Automatic inventory deduction
- ✅ Inventory restoration on cancellation

### Non-Functional Requirements
- Simple architecture following existing patterns
- No payment gateway integration (manual payment tracking)
- No email notifications
- No customer accounts (orders linked by email only)

## Architecture: Simple Relational

### Database Schema

#### Order Model
```prisma
model Order {
  id              Int         @id @default(autoincrement())
  orderNumber     String      @unique @db.VarChar(20)

  customerName    String      @map("customer_name") @db.VarChar(255)
  customerEmail   String      @map("customer_email") @db.VarChar(255)
  customerPhone   String?     @map("customer_phone") @db.VarChar(50)
  customerMessage String?     @map("customer_message") @db.Text

  status          OrderStatus @default(PENDING_PAYMENT)
  itemCount       Int         @map("item_count")
  subtotal        Decimal     @db.Decimal(10, 2)

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  items           OrderItem[]

  @@index([status])
  @@index([customerEmail])
  @@index([createdAt])
  @@map("orders")
}

enum OrderStatus {
  PENDING_PAYMENT @map("pending_payment")
  PAID            @map("paid")
  PROCESSING      @map("processing")
  SHIPPED         @map("shipped")
  COMPLETED       @map("completed")
  CANCELLED       @map("cancelled")
}

model OrderItem {
  id           Int     @id @default(autoincrement())
  orderId      Int     @map("order_id")
  productId    Int     @map("product_id")

  sku          String  @db.VarChar(100)
  productName  String  @map("product_name") @db.VarChar(255)
  pricePerUnit Decimal @map("price_per_unit") @db.Decimal(10, 2)
  quantity     Int

  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}
```

**Design Decisions:**
- Customer info embedded (no separate Customer table - YAGNI)
- OrderItem snapshots preserve historical pricing
- Foreign keys maintained for analytics
- Status enum covers full order lifecycle

### API Endpoints

#### 1. Create Order
**`POST /api/orders/create`**

**Request:**
```typescript
{
  customer: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  },
  items: Array<{
    productId: number;
    quantity: number;
  }>
}
```

**Process:**
1. Validate cart items (stock availability, pricing)
2. Generate order number: `ORD-YYYYMMDD-###`
3. Create order + items in database transaction
4. Deduct inventory for each product
5. Return order details

**Response:**
```typescript
{
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
}
```

#### 2. List Orders (Admin)
**`GET /api/admin/orders`**

**Query Parameters:**
- `status?: OrderStatus` - Filter by status
- `search?: string` - Search customer name/email
- `page?: number` - Page number (default: 1)
- `limit?: number` - Results per page (default: 20)

**Response:**
```typescript
{
  orders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: OrderStatus;
    itemCount: number;
    subtotal: number;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### 3. Get Single Order (Admin)
**`GET /api/admin/orders/[id]`**

**Response:**
```typescript
{
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerMessage: string | null;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productId: number;
    sku: string;
    productName: string;
    pricePerUnit: number;
    quantity: number;
  }>;
}
```

#### 4. Update Order Status (Admin)
**`PATCH /api/admin/orders/[id]`**

**Request:**
```typescript
{
  status: OrderStatus;
}
```

**Logic:**
- If new status is CANCELLED: restore inventory
- Update order status
- Return updated order

### UI Components

#### Admin Orders List (`/admin/orders`)
- **Layout:** Table with sortable columns
- **Columns:** Order #, Customer, Date, Items, Total, Status
- **Filters:** Status dropdown, search input, date range
- **Actions:** Click row to view details
- **Pagination:** Previous/Next + page numbers

#### Admin Order Detail (`/admin/orders/[id]`)
- **Customer Info Card:** Name, email, phone, message
- **Order Items Table:** Product, SKU, Qty, Price, Subtotal
- **Order Summary:** Item count, subtotal
- **Status Management:** Dropdown to change status
- **Actions:** Cancel order button (conditional)
- **Metadata:** Order #, created date, last updated

#### Checkout Integration (`/cart/checkout`)
**Modifications:**
1. Update form submit handler
2. Call `POST /api/orders/create` instead of console.log
3. Show loading spinner during creation
4. On success: Display order number modal, clear cart
5. On error: Show error alert, preserve cart

### Inventory Management

#### Auto-Deduct on Order Creation
```typescript
// Within database transaction
for (const item of cartItems) {
  await prisma.inventoryStock.update({
    where: { productId: item.productId },
    data: {
      quantityAvailable: { decrement: item.quantity }
    }
  });
}
```

#### Restore on Cancellation
```typescript
// When status changed to CANCELLED
const order = await prisma.order.findUnique({
  where: { id },
  include: { items: true }
});

for (const item of order.items) {
  await prisma.inventoryStock.update({
    where: { productId: item.productId },
    data: {
      quantityAvailable: { increment: item.quantity }
    }
  });
}
```

### Order Number Generation

**Format:** `ORD-YYYYMMDD-###`

**Example:** `ORD-20251206-001`

**Logic:**
```typescript
const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
const todayPrefix = `ORD-${today}`;

const lastOrder = await prisma.order.findFirst({
  where: { orderNumber: { startsWith: todayPrefix } },
  orderBy: { orderNumber: 'desc' }
});

const sequence = lastOrder
  ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1
  : 1;

const orderNumber = `${todayPrefix}-${String(sequence).padStart(3, '0')}`;
```

## Data Flow

### Order Creation Flow
1. Customer fills checkout form
2. Frontend validates form (React Hook Form + Zod)
3. POST to `/api/orders/create` with customer + cart items
4. API validates cart against current inventory
5. API generates order number
6. API creates Order + OrderItems in transaction
7. API deducts inventory
8. API returns order details
9. Frontend shows success with order number
10. Frontend clears cart

### Order Status Update Flow
1. Admin views order detail page
2. Admin selects new status from dropdown
3. PATCH to `/api/admin/orders/[id]`
4. API validates status transition
5. If CANCELLED: restore inventory
6. API updates order status
7. API returns updated order
8. Frontend refreshes order details

## Error Handling

### Order Creation Errors
- **Validation failed:** Return 400 with details
- **Out of stock:** Return 409 with stock info
- **Database error:** Rollback transaction, return 500
- **Inventory update failed:** Rollback order creation

### Status Update Errors
- **Order not found:** Return 404
- **Invalid status transition:** Return 400
- **Inventory restore failed:** Log error but complete status update

## Testing Strategy

### Unit Tests
- Order number generation (uniqueness, format)
- Inventory deduction logic
- Inventory restoration logic
- Status transition validation

### Integration Tests
- Create order API endpoint
- List orders with filters
- Update order status
- Inventory changes reflect correctly

### Manual Testing
- Complete checkout flow end-to-end
- Filter orders by different criteria
- Update order statuses
- Cancel order and verify inventory restored
- Multiple concurrent orders (race conditions)

## Security Considerations

- ✅ Admin routes protected by middleware (existing)
- ✅ Order creation validates inventory before commit
- ✅ Prisma prevents SQL injection
- ✅ Transaction ensures data consistency
- ✅ Status updates restricted to admin only

## Performance Considerations

- Indexed fields: status, customerEmail, createdAt
- Pagination on orders list
- Limit includes on detail page only
- Transaction timeout: 5 seconds

## Future Enhancements (Not in this implementation)

- Email notifications on order status changes
- Customer order history (requires user accounts)
- Bulk order operations
- Order notes/comments
- Advanced reporting and analytics
- Payment gateway integration
- Shipping tracking integration

---

**Approved by:** User (via brainstorming session)
**Next Steps:** Create implementation plan and execute
