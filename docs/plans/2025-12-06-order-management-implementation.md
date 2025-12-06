# Order Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete order management system with database persistence, status tracking, inventory management, and admin interface.

**Architecture:** Simple relational schema with Order and OrderItem models. RESTful API endpoints for order creation and admin management. React admin pages with filtering and status updates. Automatic inventory deduction with rollback on cancellation.

**Tech Stack:** React 19, Next.js 15 App Router, TypeScript, Prisma ORM, Zod validation, shadcn/ui components

---

## Task 1: Update Database Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add OrderStatus enum**

Add after the existing enums in `prisma/schema.prisma`:

```prisma
enum OrderStatus {
  PENDING_PAYMENT @map("pending_payment")
  PAID            @map("paid")
  PROCESSING      @map("processing")
  SHIPPED         @map("shipped")
  COMPLETED       @map("completed")
  CANCELLED       @map("cancelled")
}
```

**Step 2: Add Order model**

Add after the SupplierQuote model:

```prisma
model Order {
  id              Int         @id @default(autoincrement())
  orderNumber     String      @unique @map("order_number") @db.VarChar(20)

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
```

**Step 3: Add OrderItem model**

Add after Order model:

```prisma
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

**Step 4: Add OrderItem relation to Product model**

Find the Product model and add to the relations section:

```prisma
orderItems   OrderItem[]
```

**Step 5: Generate Prisma client**

Run:
```bash
npx prisma generate
```

Expected: Prisma Client regenerated with new models

**Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Order and OrderItem models to schema"
```

---

## Task 2: Create Order Types and Utilities

**Files:**
- Create: `lib/orders/types.ts`
- Create: `lib/orders/order-number.ts`

**Step 1: Create order types**

Create `lib/orders/types.ts`:

```typescript
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateOrderData {
  customer: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  createdAt: string;
}
```

**Step 2: Create order number generator**

Create `lib/orders/order-number.ts`:

```typescript
import { prisma } from '@/lib/prisma';

export async function generateOrderNumber(): Promise<string> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const todayPrefix = `ORD-${today}`;

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: todayPrefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });

  const sequence = lastOrder
    ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1
    : 1;

  return `${todayPrefix}-${String(sequence).padStart(3, '0')}`;
}
```

**Step 3: Commit**

```bash
git add lib/orders/
git commit -m "feat: add order types and order number generator"
```

---

## Task 3: Create Order Creation API Endpoint

**Files:**
- Create: `app/api/orders/create/route.ts`
- Create: `lib/validation/order.ts`

**Step 1: Create validation schema**

Create `lib/validation/order.ts`:

```typescript
import { z } from 'zod';

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    message: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
```

**Step 2: Create order creation API**

Create `app/api/orders/create/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validation/order';
import { generateOrderNumber } from '@/lib/orders/order-number';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validated = createOrderSchema.parse(body);

    // Validate cart items (check stock and pricing)
    const productIds = validated.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        stock: true,
      },
    });

    // Check all products exist
    if (products.length !== validated.items.length) {
      return NextResponse.json(
        { error: 'Some products not found or inactive' },
        { status: 404 }
      );
    }

    // Validate stock and calculate totals
    let itemCount = 0;
    let subtotal = 0;

    for (const item of validated.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const stockAvailable = product.stock?.quantityAvailable || 0;
      if (item.quantity > stockAvailable) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.baseName}. Only ${stockAvailable} available.`
          },
          { status: 409 }
        );
      }

      // Calculate price
      const avgCostPerGram = product.stock?.avgCostPerGram?.toNumber() || 0;
      const markupPercentage = 40;
      const weightGrams = product.sizeMm.toNumber();
      const price = avgCostPerGram * (1 + markupPercentage / 100) * weightGrams;

      itemCount += item.quantity;
      subtotal += price * item.quantity;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: validated.customer.name,
          customerEmail: validated.customer.email,
          customerPhone: validated.customer.phone,
          customerMessage: validated.customer.message,
          status: 'PENDING_PAYMENT',
          itemCount,
          subtotal: parseFloat(subtotal.toFixed(2)),
          items: {
            create: validated.items.map(item => {
              const product = products.find(p => p.id === item.productId)!;
              const avgCostPerGram = product.stock?.avgCostPerGram?.toNumber() || 0;
              const markupPercentage = 40;
              const weightGrams = product.sizeMm.toNumber();
              const price = avgCostPerGram * (1 + markupPercentage / 100) * weightGrams;

              return {
                productId: item.productId,
                sku: product.sku,
                productName: product.baseName,
                pricePerUnit: parseFloat(price.toFixed(2)),
                quantity: item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct inventory
      for (const item of validated.items) {
        await tx.inventoryStock.update({
          where: { productId: item.productId },
          data: {
            quantityAvailable: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

**Step 3: Test order creation**

Run dev server and test with curl:
```bash
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Test Customer",
      "email": "test@example.com",
      "phone": "1234567890"
    },
    "items": [
      {"productId": 1, "quantity": 2}
    ]
  }'
```

Expected: JSON response with orderId, orderNumber, status, subtotal

**Step 4: Commit**

```bash
git add app/api/orders/create/ lib/validation/order.ts
git commit -m "feat: add order creation API endpoint with inventory deduction"
```

---

## Task 4: Create Admin Orders List API

**Files:**
- Create: `app/api/admin/orders/route.ts`

**Step 1: Create list orders API**

Create `app/api/admin/orders/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { orderNumber: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        status: true,
        itemCount: true,
        subtotal: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test list orders API**

```bash
curl http://localhost:3000/api/admin/orders?page=1&limit=10
```

Expected: JSON with orders array and pagination object

**Step 3: Commit**

```bash
git add app/api/admin/orders/route.ts
git commit -m "feat: add admin orders list API with filtering and pagination"
```

---

## Task 5: Create Admin Single Order and Update APIs

**Files:**
- Create: `app/api/admin/orders/[id]/route.ts`

**Step 1: Create get and update order API**

Create `app/api/admin/orders/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            sku: true,
            productName: true,
            pricePerUnit: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const body = await request.json();

    const updateSchema = z.object({
      status: z.enum([
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'SHIPPED',
        'COMPLETED',
        'CANCELLED'
      ]),
    });

    const validated = updateSchema.parse(body);

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If changing to CANCELLED, restore inventory
    if (validated.status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: validated.status },
        });

        // Restore inventory
        for (const item of currentOrder.items) {
          await tx.inventoryStock.update({
            where: { productId: item.productId },
            data: {
              quantityAvailable: { increment: item.quantity },
            },
          });
        }
      });
    } else {
      // Just update status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: validated.status },
      });
    }

    // Get updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test get order API**

```bash
curl http://localhost:3000/api/admin/orders/1
```

Expected: JSON with full order details including items

**Step 3: Test update order API**

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}'
```

Expected: JSON with updated order

**Step 4: Commit**

```bash
git add "app/api/admin/orders/[id]/"
git commit -m "feat: add get and update order APIs with inventory restoration"
```

---

## Task 6: Create Admin Orders List Page

**Files:**
- Create: `app/admin/orders/page.tsx`
- Create: `components/admin/orders-table.tsx`

**Step 1: Create orders table component**

Create `components/admin/orders-table.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  itemCount: number;
  subtotal: number;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
            >
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <div>{order.customerName}</div>
                <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.itemCount}</TableCell>
              <TableCell>${order.subtotal.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={statusColors[order.status] || ''} variant="outline">
                  {order.status.replace('_', ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
```

**Step 2: Create orders list page**

Create `app/admin/orders/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrdersTable } from '@/components/admin/orders-table';
import { ArrowLeft } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search customer name, email, or order #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />

            <Select value={status} onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
          ) : (
            <>
              <OrdersTable orders={orders} />

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    Page {page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Test orders list page**

```bash
npm run dev
```

Navigate to http://localhost:3000/admin/orders

Expected: Orders list with filters and pagination

**Step 4: Commit**

```bash
git add app/admin/orders/page.tsx components/admin/orders-table.tsx
git commit -m "feat: add admin orders list page with filtering"
```

---

## Task 7: Create Admin Order Detail Page

**Files:**
- Create: `app/admin/orders/[id]/page.tsx`

**Step 1: Create order detail page**

Create `app/admin/orders/[id]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('Order not found');
      router.push('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Change order status to ${newStatus.replace('_', ' ')}?`)) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading order...</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order {order.orderNumber}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge className={statusColors[order.status]} variant="outline">
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>Email:</strong> {order.customerEmail}</p>
                  {order.customerPhone && (
                    <p><strong>Phone:</strong> {order.customerPhone}</p>
                  )}
                  {order.customerMessage && (
                    <p><strong>Message:</strong> {order.customerMessage}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.pricePerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${(item.pricePerUnit * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Subtotal ({order.itemCount} items)
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${order.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Step 2: Test order detail page**

Navigate to http://localhost:3000/admin/orders/1

Expected: Order details with customer info, items table, and status dropdown

**Step 3: Commit**

```bash
git add "app/admin/orders/[id]/"
git commit -m "feat: add admin order detail page with status updates"
```

---

## Task 8: Update Checkout Page to Create Orders

**Files:**
- Modify: `app/(public)/cart/checkout/page.tsx`

**Step 1: Read current checkout page**

View `app/(public)/cart/checkout/page.tsx` to see current implementation

**Step 2: Update checkout to call order API**

Replace the `onSubmit` function in `app/(public)/cart/checkout/page.tsx`:

```typescript
const onSubmit = async (data: CheckoutFormData) => {
  setIsSubmitting(true);

  try {
    // Create order
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        },
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    const order = await response.json();

    // Show success message
    alert(`Order created successfully!\n\nOrder Number: ${order.orderNumber}\n\nWe'll contact you at ${data.email} to arrange payment and shipping.`);

    // Clear cart
    clearCart();

    // Redirect to home
    router.push('/');

  } catch (error: any) {
    console.error('Order creation error:', error);
    alert(error.message || 'Failed to create order. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Step 3: Test checkout flow**

1. Add items to cart
2. Go to checkout
3. Fill form and submit
4. Verify order created in database
5. Verify inventory deducted
6. Verify cart cleared

Expected: Order created successfully with order number displayed

**Step 4: Commit**

```bash
git add "app/(public)/cart/checkout/page.tsx"
git commit -m "feat: integrate order creation into checkout flow"
```

---

## Task 9: Update Development Status

**Files:**
- Modify: `DEVELOPMENT_STATUS.md`

**Step 1: Update completed features**

Add to the "Completed Features" section in `DEVELOPMENT_STATUS.md`:

```markdown
- ✅ **Order Management System** (Dec 2025)
  - Database schema with Order and OrderItem models
  - Order creation API with automatic inventory deduction
  - Admin orders list with filtering and pagination
  - Admin order detail with status updates
  - Inventory restoration on order cancellation
  - Integration with checkout flow
  - Order number generation (ORD-YYYYMMDD-###)
```

**Step 2: Update missing features**

Update the "Missing Features" section:

```markdown
- ✅ Order management - COMPLETE
- ❌ Email notifications
- ❌ User accounts
```

**Step 3: Update last updated date**

```markdown
**Last Updated:** 2025-12-06
**Status:** Order Management Complete
```

**Step 4: Commit**

```bash
git add DEVELOPMENT_STATUS.md
git commit -m "docs: update development status - order management complete"
```

---

## Execution Notes

**DRY Principles:**
- Reuse existing patterns from product APIs
- Leverage existing UI components
- Share validation schemas

**YAGNI Principles:**
- No separate Customer table (embedded in orders)
- No email notifications (manual process)
- No complex order workflows (6 simple statuses)
- No payment gateway integration

**TDD Workflow:**
- Test API endpoints with curl
- Manual testing of UI flows
- Verify inventory changes in database

**Commit Frequency:**
- After each completed task
- Use conventional commits (feat:, docs:)

---

**Last Updated:** 2025-12-06
**Status:** Ready for execution
