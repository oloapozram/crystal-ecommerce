export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  baseName: string;
  size: number;
  quality: string;
  element: string | null;
  pricePerUnit: number;
  quantity: number;
  primaryImage: string | null;
  stockAvailable: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface CartContextType {
  cart: Cart;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}
