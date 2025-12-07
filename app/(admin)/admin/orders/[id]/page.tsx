'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: number;
  sku: string;
  productName: string;
  pricePerUnit: string;
  quantity: number;
  product: {
    id: number;
    baseName: string;
    variety: string | null;
    sku: string;
    isActive: boolean;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerMessage: string | null;
  status: OrderStatus;
  itemCount: number;
  subtotal: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/orders');
          return;
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 text-muted-foreground">
          Order not found
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(order.subtotal);

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4"
        >
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{order.orderNumber}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created {new Date(order.createdAt).toLocaleString()}</span>
              <span>•</span>
              <span>Updated {new Date(order.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const itemTotal =
                    parseFloat(item.pricePerUnit) * item.quantity;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          {!item.product.isActive && (
                            <span className="text-xs text-red-600">
                              (Inactive)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(item.pricePerUnit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${itemTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          {order.customerMessage && (
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Message</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {order.customerMessage}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{order.customerName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{order.customerEmail}</div>
              </div>
              {order.customerPhone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{order.customerPhone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{order.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <div className="space-y-4">
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
              {newStatus === 'CANCELLED' && order.status !== 'CANCELLED' && (
                <p className="text-xs text-muted-foreground">
                  Note: Cancelling this order will restore inventory for all items.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
