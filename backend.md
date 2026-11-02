# MicroCart: Backend

Simple e-commerce API with hard limits: **max 100 products** and **max 1000 clients**. Payments use UPI.

## 1. Tech Stack

| Area | Choice |
|------|--------|
| Framework | NestJS (TypeScript) |
| Database | MySQL (Railway, Aiven, or a local Docker instance) |
| ORM | TypeORM with migrations |
| Auth | JWT (stateless), `bcrypt` for passwords |
| Validation | `class-validator` + DTOs |
| Logging | Winston |
| Hosting | Render (free web service) |

## 2. Assumptions

- Two roles: `admin` and `client`.
- Max 100 products in the catalog (deleted products do not count). No bulk upload.
- Max 1000 client accounts. Admin accounts do not count toward this limit.
- UPI-only payments. `PAYMENT_MODE` selects `mock` (development) or `manual` (real payments verified by an admin from the customer's UTR). An order is created only after the payment is verified as successful.
- A single MySQL instance is enough for 1000 users.

## 3. Limits

| Limit | Value | Where enforced | Response when reached |
|-------|-------|----------------|-----------------------|
| Products | 100 | `POST /products` | `409 Conflict`, "Product limit (100) reached" |
| Clients | 1000 | `POST /auth/register` | `403 Forbidden`, "Registrations are closed" |

- Read the limits from `MAX_PRODUCTS` and `MAX_CLIENTS` in the env file.
- Count rows inside a transaction before inserting, so two simultaneous requests cannot go over the limit.
- Count only `products` where `isDeleted = false` and only `users` where `role = 'client'`.
- Admin can free a slot by deleting a product.

## 4. Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── guards/          # JwtAuthGuard, RolesGuard
│   │   ├── decorators/      # @Roles(), @CurrentUser()
│   │   ├── filters/         # GlobalExceptionFilter
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/              # env + TypeORM config
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── cart/
│   ├── payments/
│   ├── orders/
│   └── migrations/
├── .env
└── package.json
```

## 5. Database Schema

| Table | Fields |
|-------|--------|
| `users` | `id` (PK), `email` (unique), `password`, `role` (`admin`/`client`), `createdAt` |
| `products` | `id` (PK), `name`, `price`, `description`, `imageData` (longblob), `imageMimeType`, `imageUpdatedAt`, `stock`, `isDeleted`, `createdBy` (FK → users) |
| `carts` | `id` (PK), `userId` (FK, unique), `createdAt` |
| `cart_items` | `id` (PK), `cartId` (FK), `productId` (FK), `quantity`, `priceAtAdd` |
| `payments` | `id` (PK), `cartId` (FK), `upiId`, `amount`, `status` (`pending`/`success`/`failed`), `utr` (unique, nullable), `failureReason`, `reviewedAt`, `reviewedBy` (FK → users, nullable), `createdAt` |
| `payment_settings` | `id` (PK, always 1), `qrImageData` (longblob), `qrImageMimeType`, `qrImageUpdatedAt`, `updatedBy` (FK → users, nullable), `updatedAt` |
| `orders` | `id` (PK), `userId` (FK), `paymentId` (FK, unique), `total`, `status` (`paid`), `createdAt` |
| `order_items` | `id` (PK), `orderId` (FK), `productId` (FK, nullable), `productName`, `unitPrice`, `quantity`, `subtotal` |

### Relationships

- `User` → `Cart`: one-to-one (each user has one active cart).
- `Cart` → `CartItem`: one-to-many.
- `Product` → `CartItem`: one-to-many.
- `Cart` → `Payment`: one-to-many (a retry after a failed payment creates a new row).
- `Payment` → `Order`: one-to-one (created only after successful settlement).
- `User` → `Order`: one-to-many.
- `Order` → `OrderItem`: one-to-many; item names and prices are immutable snapshots.

### Indexes

- `users.email` (unique)
- `carts.userId` (unique)
- `cart_items (cartId, productId)` (unique, so one row per product per cart)
- `payments.utr` (unique, nullable)
- `payments.status`
- `orders.paymentId` (unique)

## 6. Modules and APIs

### 6.1 Auth

| Method | Route | Description | Body |
|--------|-------|-------------|------|
| POST | `/auth/register` | Register a user (role defaults to `client`) | `{ email, password }` |
| POST | `/auth/login` | Log in and receive a JWT | `{ email, password }` |
| GET | `/auth/me` | Current user (protected) | none |

- Hash passwords with `bcrypt`.
- The JWT payload holds `userId` and `role`.
- Reject with `403` when 1000 client accounts already exist.
- Ignore any `role` sent in the register body. Create admins through a seed script or the Users module.

### 6.2 Users (admin only)

| Method | Route | Description | Body |
|--------|-------|-------------|------|
| GET | `/users` | List users | none |
| GET | `/users/:id` | Get a user | none |
| PUT | `/users/:id` | Update role | `{ role }` |
| DELETE | `/users/:id` | Delete a user | none |

Protect all routes with `JwtAuthGuard` and `RolesGuard` using `@Roles('admin')`.

### 6.3 Products

| Method | Route | Access | Description | Body |
|--------|-------|--------|-------------|------|
| GET | `/products` | Public | List products, paginated (default `limit` 20) | query: `limit`, `page` |
| GET | `/products/:id` | Public | Get a product | none |
| GET | `/products/:id/image` | Public | Stream the uploaded product image | none |
| POST | `/products` | Admin | Add a product, optionally with an image (fails at 100) | `{ name, price, description, stock, image? }` |
| PUT | `/products/:id` | Admin | Update a product; `image: null` removes the image | `{ price, stock, image?, ... }` |
| DELETE | `/products/:id` | Admin | Soft delete | none |

- Validate `price > 0` and `stock >= 0`.
- Return `409` on `POST /products` when 100 active products exist.
- Soft delete by setting `isDeleted = true`, and filter deleted rows from list queries.
- Images are optional and accepted as a base64 PNG/JPEG data URL in `image`. Decode and validate the magic bytes, reject payloads over 2 MB, and store the bytes in `imageData` with `imageMimeType` and `imageUpdatedAt`.
- Return `imageUrl` (`/products/:id/image?v=<imageUpdatedAt>`) in product and cart responses; it is `null` when there is no image. Serve the image with `Cache-Control: public, max-age=31536000, immutable`.
- The JSON body limit is 4 MB, so a 2.8 MB data URL fits comfortably.

### 6.4 Cart

| Method | Route | Description | Body |
|--------|-------|-------------|------|
| GET | `/cart` | Get the current user's cart | none |
| POST | `/cart/items` | Add an item | `{ productId, quantity }` |
| PUT | `/cart/items/:id` | Update quantity | `{ quantity }` |
| DELETE | `/cart/items/:id` | Remove an item | none |
| POST | `/cart/checkout` | Create a pending payment | none |

- The cart belongs to `userId`. There are no guest carts.
- Check `product.stock >= quantity` when adding or updating.
- Store `priceAtAdd` so later price changes do not affect existing cart items.
- On checkout, calculate the total on the server. Do not trust a client-sent amount.

### 6.5 Payments

| Method | Route | Description | Body |
|--------|-------|-------------|------|
| POST | `/payments` | Simulate a UPI payment (mock mode only) | `{ cartId, upiId }` |
| POST | `/payments/webhook` | Provider callback, protected by `x-webhook-secret` | provider payload |
| GET | `/payments/config` | Get UPI ID, mode, and uploaded QR image URL | none |
| GET | `/payments/config/qr` | Serve the uploaded QR image (public) | none |
| PUT | `/payments/config/qr` | Upload or replace the QR image (admin) | `{ image }` |
| DELETE | `/payments/config/qr` | Remove the QR image (admin) | none |
| GET | `/payments` | List payments for the admin verification queue | none |
| GET | `/payments/:id` | Get payment status | none |
| POST | `/payments/:id/utr` | Customer submits the 12-digit UTR | `{ utr }` |
| POST | `/payments/:id/confirm` | Admin confirms a verified payment | none |
| POST | `/payments/:id/reject` | Admin rejects a payment | `{ reason? }` |

- Checkout returns a UPI link such as `upi://pay?pa=yourupi@bank&am=<amount>&cu=INR&pn=Purelis&tn=Order+payment`. The frontend renders it as a QR code.
- `PAYMENT_MODE=manual` is the real flow:
  1. The customer pays with any UPI app and submits the 12-digit UTR.
  2. The payment stays `pending`; no order or stock change happens.
  3. An admin checks the UTR against the store bank statement and calls `confirm`.
  4. `confirm` reduces stock, creates an immutable order snapshot, clears the cart, and marks the payment `success` in one transaction.
  5. `reject` marks the payment `failed` with a reason, leaves the cart intact, and creates no order.
- `PAYMENT_MODE=mock` keeps the old developer flow: `POST /payments` settles immediately. It returns `403` in manual mode.
- UTRs are unique across payments. Submitting a duplicate UTR returns `409`.
- The webhook is idempotent. In manual mode it is disabled until `PAYMENT_WEBHOOK_SECRET` is configured. For a real provider, verify its own signature before this endpoint is exposed.

### 6.6 Orders

| Method | Route | Description | Body |
|-------|-------|-------------|------|
| GET | `/orders` | List order history (own orders for clients, all for admins) | none |
| GET | `/orders/:id` | Get an order owned by the caller or any order as admin | none |

- `GET /orders` supports `page`, `limit`, `status`, and `search` query parameters.
- Order items snapshot `productName`, `unitPrice`, `quantity`, and `subtotal`, so history survives catalog edits and product removal.

## 7. Key Flows

### Authentication

1. Register: validate the DTO, hash the password, save the user with `role = client`.
2. Login: compare the hash, sign a JWT with `userId` and `role`.
3. Protected routes: `JwtAuthGuard` verifies the token, `RolesGuard` checks the role.

### Checkout

1. Client calls `POST /cart/checkout`.
2. Server re-checks stock and prices, then creates a `payments` row with `status = pending`.
3. Client shows the UPI QR code. After paying, the customer submits the 12-digit UTR with `POST /payments/:id/utr`.
4. An admin verifies the UTR against the bank statement and calls `POST /payments/:id/confirm` (or `reject`).
5. On confirm, in one transaction: reduce stock, create the order and item snapshot, clear the cart, then mark the payment `success`.
6. On reject: mark the payment `failed`; the cart stays intact and no order is created.
7. `GET /orders` returns the customer's order history. `PAYMENT_MODE=mock` replaces steps 3–4 with `POST /payments`.

## 8. Cross-Cutting Concerns

- **Validation:** global `ValidationPipe` with `whitelist: true` and `transform: true`.
- **Errors:** a global exception filter returns `{ statusCode, message, errors }`.
- **Rate limiting:** `@nestjs/throttler`, with a tighter limit on `/auth/login`.
- **CORS:** allow only the frontend origin.
- **Security headers:** `helmet`.
- **SQL injection:** use TypeORM queries and query builder parameters. Never concatenate user input into SQL.
- **Logging:** Winston, with request IDs on each log line.

## 9. Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=change-me
DB_NAME=microcart
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
MAX_PRODUCTS=100
MAX_CLIENTS=1000
UPI_ID=yourupi@bank
UPI_PAYEE_NAME=Purelis
UPI_NOTE=Order payment
PAYMENT_MODE=manual
PAYMENT_WEBHOOK_SECRET=
```

`PAYMENT_MODE` is `manual` or `mock`. In manual mode, set `PAYMENT_WEBHOOK_SECRET` only if a provider webhook is used; otherwise the webhook returns `403`. `UPI_ID` is validated at startup against `^[\w.-]+@[\w.-]+$`.

## 10. Migrations

Set `synchronize: false` in production and use migrations.

```bash
npm run typeorm migration:generate -- src/migrations/Init
npm run migration:run
```

The repository includes these migrations:

- `1794000000000-AddProductImages`: adds `imageData`, `imageMimeType`, and `imageUpdatedAt` to `products`.
- `1795000000000-AddPaymentVerification`: adds `utr` (unique), `failureReason`, `reviewedAt`, and `reviewedBy` to `payments`, plus status and reviewer indexes.
- `1796000000000-AddPaymentSettings`: creates the `payment_settings` singleton table for the uploaded payment QR image.

Run `npm run migration:run` after pulling these changes, and `npm run migration:run:prod` against the compiled build in production. Without the product-image migration, product queries and uploads fail. Without the payment-verification migration, payment queries fail because the columns are missing. Without the payment-settings migration, the payment config and QR upload endpoints fail.

Example:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1698900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN role ENUM('admin','client') NOT NULL DEFAULT 'client'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN role`);
  }
}
```

## 11. Testing

- Unit tests with Jest for services (auth, cart, payments).
- E2E tests with Supertest for auth, cart, and checkout flows.
- Use a separate test database.

## 12. Deployment

1. Push the `backend/` folder to GitHub.
2. Create a Render Web Service with build command `npm install && npm run build` and start command `npm run start:prod`.
3. Add the environment variables from section 9, pointing `DB_*` at your hosted MySQL.
4. Run migrations on deploy, for example with a `postdeploy` script.
5. Note: Render's free tier sleeps after inactivity, so the first request can be slow.

## 13. Setup Commands

```bash
npm i -g @nestjs/cli
nest new backend
cd backend
npm i @nestjs/typeorm typeorm mysql2 @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer @nestjs/throttler helmet winston
npm i -D @types/bcrypt @types/passport-jwt
```
