# MicroCart: Frontend

Simple React + Tailwind CSS storefront for the MicroCart API (see `backend.md`). The shop has at most 100 products and 1000 clients. The home page paginates the product grid.

## 1. Tech Stack

| Area | Choice |
|------|--------|
| Framework | React 18 + TypeScript, built with Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router |
| State | Context API (Zustand if it grows) |
| Forms | React Hook Form + Zod |
| HTTP | Axios with an auth interceptor |
| QR code | `react-qr-code` |
| Testing | Vitest + React Testing Library |
| Hosting | Vercel (free) |

Vite replaces Create React App, which is deprecated.

## 2. Project Structure

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/             # axios instance, per-resource API calls
│   ├── context/         # AuthContext, CartContext
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductImage.tsx     # uploaded image or generated artwork fallback
│   │   ├── CartItem.tsx
│   │   ├── UPIScanner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Orders.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── OrdersAdmin.tsx
│   │       ├── PaymentsAdmin.tsx
│   │       ├── ProductsAdmin.tsx
│   │       └── UsersAdmin.tsx
│   ├── types/
│   ├── utils/           # imageUpload, media URL resolution, formatting
│   └── index.css
├── .env
└── tailwind.config.js
```

## 3. Pages

| Page | Route | Access | Notes |
|------|-------|--------|-------|
| Home | `/` | Public | Product grid from `GET /products` with page controls (max 100 products) |
| Product Detail | `/products/:id` | Public | Name, price, description, stock, "Add to Cart" |
| Cart | `/cart` | Logged in | Items, quantity controls, total, "Pay with UPI" |
| Login | `/login` | Public | JWT login |
| Signup | `/signup` | Public | Registers a `client` account. Shows "Registrations are closed" if the backend returns `403` |
| Orders | `/orders` | Logged in | Customer order history with the saved item snapshot |
| Admin Orders | `/admin/orders` | Admin | All orders with customer, status, and totals |
| Admin Payments | `/admin/payments` | Admin | Verification queue: filter by status, search by email/payment ID/UTR, confirm or reject pending payments with a reason |
| Admin Products | `/admin/products` | Admin | Add, edit, and delete products, including image upload, preview, replace, and remove. Shows a `x / 100` counter and disables "Add product" at 100 |
| Admin People | `/admin/users` | Admin | User list and role management |

## 4. Components

- **Header:** logo, cart icon with item count, user menu (login/logout).
- **Footer:** copyright and links.
- **ProductCard:** name, price, image, "Add to Cart".
- **ProductImage:** renders the uploaded `imageUrl`; falls back to the generated `ProductArtwork` when the URL is missing or fails to load.
- **CartItem:** name, quantity stepper, price, remove button.
- **UPIScanner:** renders the UPI link from the backend as a QR code, collects the 12-digit UTR, polls the payment status, and shows pending/success/failed states. In `mock` mode it shows a "Simulate payment" button instead.
- **ProtectedRoute:** redirects to `/login` if there is no token, and checks `role` for admin routes.

## 5. State and Auth

- `AuthContext` holds `user`, `token`, `login()`, `logout()`.
- Store the JWT in memory, or in `localStorage` for simplicity on a small project. Note that `localStorage` is readable by any XSS, so keep dependencies minimal.
- An Axios request interceptor adds `Authorization: Bearer <token>`.
- A response interceptor logs the user out on `401`.
- `CartContext` mirrors `GET /cart` and refreshes after each cart mutation.

## 6. API Usage

```ts
// src/api/client.ts
import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

| Action | Call |
|--------|------|
| Register | `POST /auth/register` (`403` when 1000 clients exist) |
| Login | `POST /auth/login` |
| List products | `GET /products?page=1&limit=20` |
| Add to cart | `POST /cart/items` |
| Update / remove item | `PUT` / `DELETE /cart/items/:id` |
| Checkout | `POST /cart/checkout` |
| Submit UTR | `POST /payments/:id/utr` |
| Payment status | `GET /payments/:id` (poll while pending) |
| Mock settle | `POST /payments` (only when `mode === 'mock'`) |
| Order history | `GET /orders` (customer) / `GET /orders/:id` |
| Admin orders | `GET /orders` with an admin token |
| Admin payments | `GET /payments?status=pending&search=...` |
| Payment config / QR image | `GET /payments/config`, `PUT /payments/config/qr`, `DELETE /payments/config/qr` |
| Confirm / reject payment | `POST /payments/:id/confirm`, `POST /payments/:id/reject` |
| Create / update product | `POST /products`, `PUT /products/:id` (optional `image` data URL) |
| Product image | `GET /products/:id/image` (resolved through `resolveMediaUrl`) |

## 7. Forms and Validation

Use React Hook Form with a Zod schema.

```ts
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

Show server errors from the API under the matching field or as a banner. The `409` (product limit) and `403` (registrations closed) responses get their own clear messages.

### Product image upload (admin)

`src/utils/imageUpload.ts` prepares files before they are sent to `POST /products` or `PUT /products/:id`:

- Accepted inputs: PNG and JPEG up to 10 MB.
- The image is resized so its longest side is at most 1200 px, flattened onto white, and re-encoded as JPEG.
- Quality is stepped down (`0.86 → 0.72 → 0.6 → 0.48`) until the decoded size is 2 MB or less.
- The result is a `data:image/jpeg;base64,...` string stored in form state and used for the live preview.

`ProductsAdmin` keeps the image separate from the React Hook Form values:

- Creating: send `image` only when a file was prepared.
- Editing: omit `image` to keep the current image; send a new data URL to replace it; send `image: null` when the user removes it.
- The submit and cancel buttons are disabled while an image is being prepared.

`ProductImage` resolves relative URLs against `VITE_API_URL` (`resolveMediaUrl`) and falls back to the generated `ProductArtwork` when the image is missing or fails to load.

## 8. Design System

### Colors

| Use | Value | Tailwind |
|-----|-------|----------|
| Primary | `#3b82f6` | `blue-500` |
| Secondary | `#10b981` | `emerald-500` |
| Background | `#f8fafc` | `slate-50` |

### Typography and Layout

- Font: Inter (Google Fonts).
- Mobile-first, using Tailwind's responsive prefixes.
- Max content width: `1200px` (`max-w-[1200px] mx-auto`).

### Wireframes

Product grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {products.map((p) => (
    <ProductCard key={p.id} product={p} />
  ))}
</div>
```

Cart page:

```tsx
<div className="space-y-4">
  {items.map((item) => (
    <CartItem
      key={item.id}
      name={item.product.name}
      quantity={item.quantity}
      price={item.priceAtAdd}
    />
  ))}
  <button className="bg-emerald-500 text-white px-4 py-2 rounded">
    Pay with UPI
  </button>
</div>
```

## 9. UPI Payment UI

1. User clicks "Pay with UPI" on the cart page.
2. Frontend calls `POST /cart/checkout`, which returns a payment record, its `mode`, and the UPI link.
3. `UPIScanner` loads `GET /payments/config`. If an admin has uploaded a payment QR image, it displays that image; otherwise it renders `payment.upiLink` with `react-qr-code`.

```tsx
const qrImageUrl = resolveMediaUrl(config?.qrImageUrl);

{qrImageUrl ? (
  <img src={qrImageUrl} alt="Store UPI payment QR code" />
) : (
  <QRCode value={payment.upiLink} size={208} />
)}
```

4. Customer scans the QR with any UPI app and pays.
5. The customer copies the 12-digit UTR/RRN from the UPI app into `UPIScanner` and submits it with `POST /payments/:id/utr`.
6. `UPIScanner` polls `GET /payments/:id` every 4 seconds while the status is `pending`. When an admin verifies the payment, polling observes `success` or `failed`.
7. On success, the backend has already reduced stock, cleared the cart, and created the order. The UI links to `/orders` so the customer sees the saved snapshot.
8. On failure, the UI shows the admin's `failureReason`. The cart stays intact, so the customer can choose "Pay with UPI" again.

Mock mode (`mode === 'mock'`, local development only): `UPIScanner` shows a "Simulate payment" button that calls `POST /payments` and bypasses the UTR step.

Admin verification lives at `/admin/payments` (`PaymentsAdmin`):

- Payment QR card: upload or replace a PNG/JPEG image (max 2 MB), preview the current image, or remove it. When absent, the generated UPI QR is used.
- Filters: pending, all, success, failed.
- Search by customer email, payment ID, or UTR.
- Confirm asks for confirmation, then calls `POST /payments/:id/confirm`.
- Reject opens a modal with an optional reason and calls `POST /payments/:id/reject`.
- Refreshing the list after a decision shows the new status and reviewer timestamp.

## 10. Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

Vite only exposes variables prefixed with `VITE_`. Use `import.meta.env.VITE_API_URL`.

## 11. Setup Commands

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm i react-router-dom axios react-hook-form zod @hookform/resolvers react-qr-code
npm i -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

In `tailwind.config.js`:

```js
content: ['./index.html', './src/**/*.{ts,tsx}'],
```

In `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 12. Testing

- Component tests for `ProductCard`, `CartItem`, and the login form.
- Test the cart flow with mocked API responses.

## 13. Deployment (Vercel)

1. Push `frontend/` to GitHub and import the repo in Vercel.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Set `VITE_API_URL` to your Render backend URL.
4. Add a rewrite so client-side routes work on refresh:

```json
// vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

5. Add the Vercel domain to the backend `CORS_ORIGIN`.
