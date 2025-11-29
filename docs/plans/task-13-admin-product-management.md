# Task 13: Admin Product Management UI Implementation Plan

## Goal
Implement a comprehensive admin interface for managing products, including creating, editing, listing, and deleting products. This includes handling Bazi elements, metaphysical properties, and initial inventory setup.

## Architecture
- **Framework:** Next.js 15 App Router
- **Data Access:** Prisma ORM
- **State Management:** React Server Actions (for mutations) + React Hook Form (for client validation)
- **Validation:** Zod
- **UI Components:** Shadcn UI (Form, Input, Select, Table, Button, Toast)

## Implementation Steps

### Phase 1: Setup & Utilities
1.  **Create Zod Schema:** Define `productSchema` in `lib/validations/product.ts` matching the Prisma model.
2.  **Create Server Actions:** Implement `createProduct`, `updateProduct`, `deleteProduct` in `app/admin/products/actions.ts`.

### Phase 2: Product List UI
3.  **Create Product List Page:** `app/admin/products/page.tsx`
    -   Fetch products with stock and media.
    -   Display in a data table.
    -   Add "Add Product" button.
    -   Add "Edit" and "Delete" actions per row.

### Phase 3: Add/Edit Product Form
4.  **Create Product Form Component:** `components/admin/product-form.tsx`
    -   Reusable component for both Create and Edit.
    -   Fields: Base Name, Size, Quality, SKU, Element, Description.
    -   **Special Fields:**
        -   *Metaphysical Properties:* Tag input (enter comma-separated).
        -   *Initial Stock (Create mode only):* Simple inputs for Quantity and Cost/Gram to auto-create an `InventoryStock` and `InventoryPurchase` record (simplifies seeding).
5.  **Create "New Product" Page:** `app/admin/products/new/page.tsx`
    -   Render `ProductForm`.
6.  **Create "Edit Product" Page:** `app/admin/products/[id]/page.tsx`
    -   Fetch product data.
    -   Render `ProductForm` with default values.

### Phase 4: Integration & Polish
7.  **Add Toast Notifications:** Show success/error messages on form submission.
8.  **Verify Flow:**
    -   Create a product.
    -   Verify it appears in the list.
    -   Edit the product.
    -   Verify changes.
    -   Delete the product.

## Verification
-   [ ] Can create a new product with all fields?
-   [ ] Does the SKU auto-generate if left blank? (Optional feature)
-   [ ] Does the Bazi element save correctly?
-   [ ] Does the initial stock create a stock record?
-   [ ] Can delete a product?
