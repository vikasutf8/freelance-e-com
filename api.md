# MicroCart API

Complete API reference for the MicroCart backend. This document mirrors the Swagger/OpenAPI decorators in `backend/src` and every operation exposed at runtime.

- Interactive Swagger UI: `http://localhost:3000/docs`
- Raw OpenAPI JSON: `http://localhost:3000/docs-json`
- Default base URL: `http://localhost:3000`
- No global route prefix is used, so paths are exactly `/auth/login`, `/products`, and so on.

## Contents

| Tag | Operations |
|-----|------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `GET /users`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}` |
| Products | `GET /products`, `GET /products/{id}`, `GET /products/{id}/image`, `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` |
| Cart | `GET /cart`, `POST /cart/items`, `PUT /cart/items/{id}`, `DELETE /cart/items/{id}`, `POST /cart/checkout` |
| Payments | `POST /payments`, `POST /payments/webhook`, `GET /payments/config`, `GET /payments/config/qr`, `PUT /payments/config/qr`, `DELETE /payments/config/qr`, `GET /payments`, `GET /payments/{id}`, `POST /payments/{id}/utr`, `POST /payments/{id}/confirm`, `POST /payments/{id}/reject` |
| Orders | `GET /orders`, `GET /orders/{id}` |

31 operations across 22 unique paths.

---

## Authentication

Protected routes require a stateless JWT:

```http
Authorization: Bearer <accessToken>
```

1. Register with `POST /auth/register` or log in with `POST /auth/login`.
2. Copy the returned `accessToken`.
3. In Swagger UI, click **Authorize** and paste the token without the `Bearer ` prefix.
4. In HTTP clients, send the full header `Authorization: Bearer <accessToken>`.

The JWT payload contains:

```json
{
  "userId": 1,
  "email": "client@example.com",
  "role": "client"
}
```

Roles:

- `client` - the default role for registrations.
- `admin` - required for all `/users` routes and product writes.

Admins are created with `npm run seed:admin`, or a client can be promoted with `PUT /users/{id}`.

---

## Errors

Every error response uses this shape:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be an email"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | integer | HTTP status code. |
| `message` | string | Human-readable error. |
| `errors` | string[] | Validation or business-rule details. Empty when not applicable. |

Common status codes:

| Status | Meaning |
|--------|---------|
| `400` | Validation failed, invalid state, or insufficient stock. |
| `401` | Missing, invalid, or expired JWT. |
| `403` | Admin role required, registrations closed, or resource belongs to another user. |
| `404` | User, product, cart item, or payment not found. |
| `409` | Product limit reached, duplicate email, payment already failed, or stock conflict. |
| `429` | Rate limit exceeded. |
| `500` | Unexpected server error. |

---

## Hard limits

| Limit | Value | Enforced on | Response |
|-------|-------|-------------|----------|
| Active products | `MAX_PRODUCTS` (default `100`) | `POST /products` | `409 Conflict`, `"Product limit (100) reached"` |
| Client accounts | `MAX_CLIENTS` (default `1000`) | `POST /auth/register` | `403 Forbidden`, `"Registrations are closed"` |

- Soft-deleted products (`isDeleted = true`) do not count toward the product limit.
- Admin accounts do not count toward the client limit.
- Deleting an active product or a client frees a slot.
- Limits are counted inside a `SERIALIZABLE` database transaction before insert.

---

## Rate limits

| Scope | Limit |
|-------|-------|
| All routes per IP | 100 requests per minute |
| `POST /auth/login` per IP | 5 requests per minute |

Rate-limit headers returned by the throttler:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

Exceeding a limit returns `429 Too Many Requests` using the standard error shape.

---

## Schemas

### `UserRole`

| Value | Description |
|-------|-------------|
| `admin` | Full access to user management and product writes. |
| `client` | Storefront access: browse products and manage a personal cart. |

### `PaymentStatus`

| Value | Description |
|-------|-------------|
| `pending` | Payment created, waiting for confirmation. |
| `success` | Settled. Stock was reduced, an order snapshot was created, and the cart was cleared. |
| `failed` | Failed. A new checkout is required to retry. |

### `OrderStatus`

| Value | Description |
|-------|-------------|
| `paid` | Order created from a settled UPI payment. |

### `ErrorResponseDto`

| Field | Type | Example |
|-------|------|---------|
| `statusCode` | integer | `400` |
| `message` | string | `"Validation failed"` |
| `errors` | string[] | `["email must be an email"]` |

### `UserResponseDto`

| Field | Type | Example |
|-------|------|---------|
| `id` | integer | `1` |
| `email` | string | `"client@example.com"` |
| `role` | `UserRole` | `"client"` |
| `createdAt` | string (date-time) | `"2026-01-15T10:30:00.000Z"` |

### `AuthResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | string | JWT used as `Authorization: Bearer <token>`. |
| `user` | `UserResponseDto` | Authenticated user. |

### `RegisterDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `email` | string | yes | Valid email, max 255 chars, trimmed and lowercased. | `"client@example.com"` |
| `password` | string | yes | 8-72 chars. | `"StrongPass123!"` |

Any `role` field sent in the body is ignored; registrations always create `client` accounts.

### `LoginDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `email` | string | yes | Valid email, max 255 chars, trimmed and lowercased. | `"client@example.com"` |
| `password` | string | yes | Non-empty string, max 72 chars. | `"StrongPass123!"` |

### `ProductResponseDto`

| Field | Type | Nullable | Example |
|-------|------|----------|---------|
| `id` | integer | no | `1` |
| `name` | string | no | `"Mechanical Keyboard"` |
| `price` | number | no | `2499.99` |
| `description` | string | yes | `"Hot-swappable keyboard with PBT keycaps."` |
| `imageUrl` | string | yes | `"/products/1/image?v=1762000000"` |
| `stock` | integer | no | `25` |
| `createdBy` | integer | yes | `1` |

`imageUrl` is relative to the API origin and includes a version query string derived from `imageUpdatedAt`. It is `null` when the product has no uploaded image. Resolve it against `VITE_API_URL` in the frontend.

### `CreateProductDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `name` | string | yes | Non-empty, max 255 chars, trimmed. | `"Mechanical Keyboard"` |
| `price` | number | yes | Greater than 0, at most 2 decimals, maximum `99999999.99`. | `2499.99` |
| `description` | string | no | Max 5000 chars, nullable. | `"Hot-swappable keyboard with PBT keycaps."` |
| `image` | string | no | Base64 PNG or JPEG data URL. Decoded bytes max 2 MB, total string max 2,800,000 chars. Send `null` to remove an existing image. | `"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."` |
| `stock` | integer | yes | Integer, minimum 0. | `25` |

### `UpdateProductDto`

Partial version of `CreateProductDto`. All fields are optional; only provided fields are updated.

### `PaginationMetaDto`

| Field | Type | Example |
|-------|------|---------|
| `total` | integer | `42` |
| `page` | integer | `1` |
| `limit` | integer | `20` |
| `totalPages` | integer | `3` |

### `PaginatedProductsDto`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `ProductResponseDto[]` | Active products for the requested page. |
| `meta` | `PaginationMetaDto` | Pagination details. |

### `AddCartItemDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `productId` | integer | yes | Minimum 1. | `1` |
| `quantity` | integer | yes | Minimum 1. | `2` |

### `UpdateCartItemDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `quantity` | integer | yes | Minimum 1. | `3` |

### `CartProductDto`

| Field | Type | Nullable | Example |
|-------|------|----------|---------|
| `id` | integer | no | `1` |
| `name` | string | no | `"Mechanical Keyboard"` |
| `price` | number | no | `2499.99` |
| `description` | string | yes | `"Hot-swappable keyboard with PBT keycaps."` |
| `imageUrl` | string | yes | `"/products/1/image?v=1762000000"` |
| `stock` | integer | no | `25` |

### `CartItemResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Cart item id. |
| `productId` | integer | Product id. |
| `quantity` | integer | Quantity in the cart. |
| `priceAtAdd` | number | Unit price captured when the item was added. |
| `subtotal` | number | `priceAtAdd * quantity`, rounded to 2 decimals. |
| `product` | `CartProductDto` | Current product snapshot. |

### `CartResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Cart id. |
| `items` | `CartItemResponseDto[]` | Cart items ordered by id. |
| `total` | number | Server-calculated total, rounded to 2 decimals. |
| `itemCount` | integer | Sum of item quantities. |

### `CreatePaymentDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `cartId` | integer | yes | Minimum 1. | `4` |
| `upiId` | string | no | Max 255 chars, pattern `^[\w.-]+@[\w.-]+$` (for example `name@bank`). Defaults to the existing payment UPI ID, then `UPI_ID`. | `"yourupi@bank"` |

### `PaymentResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Payment id. |
| `cartId` | integer | Cart being paid for. |
| `upiId` | string | UPI ID used for the payment. |
| `amount` | number | Server-calculated amount. |
| `status` | `PaymentStatus` | Payment status. |
| `createdAt` | string (date-time) | Creation timestamp. |
| `upiLink` | string | UPI deep link, for example `upi://pay?pa=yourupi@bank&am=4999.98&cu=INR`. The `pa` value keeps its literal `@` so UPI apps accept it. Includes `pn` and `tn` when configured. |
| `utr` | string \| null | 12-digit UPI reference submitted by the customer. |
| `failureReason` | string \| null | Reason shown to the customer when a payment is rejected. |
| `reviewedAt` | string (date-time) \| null | When an admin confirmed or rejected the payment. |
| `mode` | `"mock" \| "manual"` | `mock` settles with the developer button; `manual` waits for admin UTR verification. |

### `SubmitPaymentUtrDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `utr` | string | yes | Exactly 12 digits; leading and trailing whitespace is trimmed. Must be unique across payments. | `"123456789012"` |

### `RejectPaymentDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `reason` | string | no | Max 255 chars. Defaults to "The payment could not be verified". | `"UTR not found in the store bank statement."` |

### `QueryPaymentsDto`

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| `page` | integer | no | Minimum 1. | `1` |
| `limit` | integer | no | 1–100. | `20` |
| `status` | `PaymentStatus` | no | `pending`, `success`, or `failed`. | — |
| `search` | string | no | Max 255 chars. Matches customer email, payment ID, or UTR. | — |

### `AdminPaymentResponseDto`

Extends `PaymentResponseDto` with:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | integer | Customer id. |
| `customerEmail` | string \| null | Customer email. |
| `itemCount` | integer | Sum of cart item quantities at verification time. |

### `PaginatedPaymentsDto`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `AdminPaymentResponseDto[]` | Payments, newest first. |
| `meta` | `PaginationMetaDto` | Total, page, limit, total pages. |

### `PaymentConfigResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `upiId` | string | Configured UPI ID. |
| `payeeName` | string | Payee name included in generated UPI links. |
| `note` | string | Transaction note included in generated UPI links. |
| `mode` | `"mock" \| "manual"` | Active payment mode. |
| `qrImageUrl` | string \| null | Uploaded QR image URL, or null when no image is stored. When present, the storefront shows this image instead of the generated QR. |

### `UpdatePaymentQrDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `image` | string | yes | Base64 PNG or JPEG data URL. Decoded size must be 2 MB or less. | `"data:image/png;base64,iVBORw0KGgo..."` |

### `PaymentWebhookDto`

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `paymentId` | integer | yes | Minimum 1. | `7` |
| `status` | `"success" \| "failed"` | yes | Must be `success` or `failed`. | `"success"` |
| `providerReference` | string | no | Max 255 chars. | `"pay_RZP_9f2c1"` |
| `signature` | string | no | Accepted for provider compatibility; not verified by this endpoint. | `"provider-signature"` |

### `OrderItemResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Order item id. |
| `productId` | integer \| null | Null if the product was permanently removed. |
| `productName` | string | Product name saved at payment time. |
| `unitPrice` | number | Unit price saved at payment time. |
| `quantity` | integer | Purchased quantity. |
| `subtotal` | number | `unitPrice * quantity`, rounded to 2 decimals. |

### `OrderResponseDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Order id. |
| `userId` | integer | Purchasing user id. |
| `customerEmail` | string \| null | Customer email, or null if unavailable. |
| `paymentId` | integer | Settled payment id. |
| `total` | number | Paid total. |
| `status` | `OrderStatus` | Current order status. |
| `itemCount` | integer | Sum of item quantities. |
| `createdAt` | string (date-time) | Order creation timestamp. |
| `items` | `OrderItemResponseDto[]` | Immutable purchased-item snapshot. |

### `QueryOrdersDto`

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| `page` | integer | no | Minimum 1. | `1` |
| `limit` | integer | no | 1–100. | `10` |
| `status` | `OrderStatus` | no | Must be a valid order status. | — |
| `search` | string | no | Max 255 chars. Admin search covers customer email, order ID, and product name; clients search within their own orders. | — |

### `PaginatedOrdersDto`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `OrderResponseDto[]` | Orders newest first. |
| `meta` | `PaginationMetaDto` | Pagination details. |

---

## Auth

### `POST /auth/register`

Register a client account.

- Access: public
- Rate limit: global 100/minute
- Body: `RegisterDto`
- `role` in the body is ignored.
- Returns a JWT immediately.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `201` | Account created and authenticated. | `AuthResponseDto` |
| `400` | Validation failed. | `ErrorResponseDto` |
| `403` | Registrations are closed (client limit reached). | `ErrorResponseDto` |
| `409` | Email already registered. | `ErrorResponseDto` |

**Request**

```json
{
  "email": "client@example.com",
  "password": "StrongPass123!"
}
```

**Response `201`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "client@example.com",
    "role": "client",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Limit response `403`**

```json
{
  "statusCode": 403,
  "message": "Registrations are closed",
  "errors": []
}
```

---

### `POST /auth/login`

Log in and receive a JWT.

- Access: public
- Rate limit: 5 requests per minute per IP
- Body: `LoginDto`

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Authenticated. | `AuthResponseDto` |
| `400` | Validation failed. | `ErrorResponseDto` |
| `401` | Invalid email or password. | `ErrorResponseDto` |
| `429` | Too many login attempts. | `ErrorResponseDto` |

**Request**

```json
{
  "email": "client@example.com",
  "password": "StrongPass123!"
}
```

**Response `200`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "client@example.com",
    "role": "client",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

---

### `GET /auth/me`

Get the user identified by the JWT.

- Access: authenticated
- No parameters

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Current user. | `UserResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "id": 1,
  "email": "client@example.com",
  "role": "client",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

## Users

All `/users` routes are admin-only:

- Access: authenticated with `role = admin`
- `401` when the token is missing, invalid, or expired
- `403` when the caller is not an admin

### `GET /users`

List all users ordered by id.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Users ordered by id. | `UserResponseDto[]` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |

**Response `200`**

```json
[
  {
    "id": 1,
    "email": "admin@microcart.local",
    "role": "admin",
    "createdAt": "2026-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "email": "client@example.com",
    "role": "client",
    "createdAt": "2026-01-15T10:31:00.000Z"
  }
]
```

---

### `GET /users/{id}`

Get a single user.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | User. | `UserResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | User not found. | `ErrorResponseDto` |

---

### `PUT /users/{id}`

Promote a client to admin or demote an admin.

- An admin cannot demote their own account.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `role` | `UserRole` | yes | `admin` or `client`. | `"admin"` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated user. | `UserResponseDto` |
| `400` | Invalid role or self-demotion attempt. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | User not found. | `ErrorResponseDto` |

**Request**

```json
{
  "role": "admin"
}
```

**Response `200`**

```json
{
  "id": 2,
  "email": "client@example.com",
  "role": "admin",
  "createdAt": "2026-01-15T10:31:00.000Z"
}
```

---

### `DELETE /users/{id}`

Delete a user account.

- Cascading foreign keys remove the user cart, cart items, payments, orders, and order items.
- An admin cannot delete their own account.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `2` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | User deleted. | `{ "message": "User deleted", "id": 2 }` |
| `400` | Self-deletion attempt. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | User not found. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "message": "User deleted",
  "id": 2
}
```

---

## Products

Reads are public. Writes require an admin JWT.

Product images are optional. The API accepts a base64 PNG or JPEG data URL in the `image` field, stores the decoded bytes in MySQL, and serves them from `GET /products/{id}/image`. The decoded image must be 2 MB or smaller; the frontend resizes images to 1200 × 1200 and re-encodes them as JPEG before sending.

### `GET /products`

Paginated list of active products, newest first. Soft-deleted products are excluded. The shop enforces a maximum of 100 active products.

- Access: public

**Query parameters**

| Name | Type | Required | Default | Validation | Example |
|------|------|----------|---------|------------|---------|
| `page` | integer | no | `1` | Minimum 1. | `1` |
| `limit` | integer | no | `20` | 1-100. | `20` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Paginated products. | `PaginatedProductsDto` |
| `400` | Invalid pagination parameters. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Mechanical Keyboard",
      "price": 2499.99,
      "description": "Hot-swappable keyboard with PBT keycaps.",
      "imageUrl": "/products/1/image?v=1762000000",
      "stock": 25,
      "createdBy": 1
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### `GET /products/{id}`

Get one active product.

- Access: public

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Product. | `ProductResponseDto` |
| `404` | Product not found or deleted. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "id": 1,
  "name": "Mechanical Keyboard",
  "price": 2499.99,
  "description": "Hot-swappable keyboard with PBT keycaps.",
  "imageUrl": "/products/1/image?v=1762000000",
  "stock": 25,
  "createdBy": 1
}
```

---

### `GET /products/{id}/image`

Stream the uploaded product image.

- Access: public
- Returns the raw PNG or JPEG bytes stored in MySQL.
- Returns `404` when the product does not exist, is deleted, or has no uploaded image.
- Responses include `Cache-Control: public, max-age=31536000, immutable`. The version in `imageUrl` changes whenever the image is replaced, so clients can cache safely.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Image bytes. | `image/png` or `image/jpeg` binary |
| `404` | Product or image not found. | `ErrorResponseDto` |

---

### `POST /products`

Create a product.

- Access: admin
- Price must be greater than 0 and stock cannot be negative.
- Returns `409` when `MAX_PRODUCTS` (default 100) active products already exist. Delete a product to free a slot.

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `name` | string | yes | Non-empty, max 255 chars, trimmed. | `"Mechanical Keyboard"` |
| `price` | number | yes | Greater than 0, at most 2 decimals, maximum `99999999.99`. | `2499.99` |
| `description` | string | no | Max 5000 chars, nullable. | `"Hot-swappable keyboard with PBT keycaps."` |
| `image` | string | no | Base64 PNG or JPEG data URL. Decoded bytes max 2 MB, total string max 2,800,000 chars. | `"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."` |
| `stock` | integer | yes | Integer, minimum 0. | `25` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `201` | Product created. | `ProductResponseDto` |
| `400` | Validation failed. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `409` | Product limit (100) reached. | `ErrorResponseDto` |

**Request**

```json
{
  "name": "Mechanical Keyboard",
  "price": 2499.99,
  "description": "Hot-swappable keyboard with PBT keycaps.",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "stock": 25
}
```

**Response `201`**

```json
{
  "id": 1,
  "name": "Mechanical Keyboard",
  "price": 2499.99,
  "description": "Hot-swappable keyboard with PBT keycaps.",
  "imageUrl": "/products/1/image?v=1762000000",
  "stock": 25,
  "createdBy": 1
}
```

**Limit response `409`**

```json
{
  "statusCode": 409,
  "message": "Product limit (100) reached",
  "errors": []
}
```

---

### `PUT /products/{id}`

Update a product.

- Access: admin
- Only provided fields are updated.
- Existing cart items keep the `priceAtAdd` captured when they were added.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Body**

Partial `CreateProductDto`: any of `name`, `price`, `description`, `image`, `stock`.

- Send `image` as a PNG/JPEG data URL to add or replace the image.
- Send `image: null` to remove the image.
- Omit `image` to keep the current image unchanged.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated product. | `ProductResponseDto` |
| `400` | Validation failed. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | Product not found or deleted. | `ErrorResponseDto` |

**Request**

```json
{
  "price": 2299.99,
  "stock": 30
}
```

---

### `DELETE /products/{id}`

Soft-delete a product.

- Access: admin
- Sets `isDeleted = true`.
- Removes the product from listings and frees a slot against the 100-product limit.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `1` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Product deleted. | `{ "message": "Product deleted", "id": 1 }` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | Product not found or already deleted. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "message": "Product deleted",
  "id": 1
}
```

---

## Cart

All cart routes require a client or admin JWT. A cart belongs to the authenticated user; guest carts are not supported. The cart is created lazily on first use.

### `GET /cart`

Get the current user cart.

- Access: authenticated
- Returns items, captured prices, per-item subtotals, and the server-calculated total.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Current cart. | `CartResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "id": 4,
  "items": [
    {
      "id": 10,
      "productId": 1,
      "quantity": 2,
      "priceAtAdd": 2499.99,
      "subtotal": 4999.98,
      "product": {
        "id": 1,
        "name": "Mechanical Keyboard",
        "price": 2499.99,
        "description": "Hot-swappable keyboard with PBT keycaps.",
        "imageUrl": "/products/1/image?v=1762000000",
        "stock": 25
      }
    }
  ],
  "total": 4999.98,
  "itemCount": 2
}
```

---

### `POST /cart/items`

Add a product to the cart or increase its quantity.

- Adds the product, or increments the existing cart row.
- Rejects quantities above available stock.
- `priceAtAdd` is captured from the current product price only when the item is first added.
- Returns the updated cart.

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `productId` | integer | yes | Minimum 1. | `1` |
| `quantity` | integer | yes | Minimum 1. | `2` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `201` | Updated cart. | `CartResponseDto` |
| `400` | Validation failed or insufficient stock. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `404` | Product not found or deleted. | `ErrorResponseDto` |

**Request**

```json
{
  "productId": 1,
  "quantity": 2
}
```

---

### `PUT /cart/items/{id}`

Update a cart item quantity.

- Sets the quantity for an item owned by the current user.
- Rejects quantities above available stock.
- Returns the updated cart.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `10` |

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `quantity` | integer | yes | Minimum 1. | `3` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated cart. | `CartResponseDto` |
| `400` | Validation failed, product unavailable, or insufficient stock. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `404` | Cart or cart item not found. | `ErrorResponseDto` |

**Request**

```json
{
  "quantity": 3
}
```

---

### `DELETE /cart/items/{id}`

Remove one item from the current user cart.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `10` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated cart. | `CartResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `404` | Cart or cart item not found. | `ErrorResponseDto` |

---

### `POST /cart/checkout`

Create or refresh a pending UPI payment.

- Re-checks product availability and stock.
- Recomputes the total on the server; a client-sent amount is never trusted.
- Creates a new `pending` payment, or refreshes the latest pending payment for the cart.
- Returns the payment with a `upi://` deep link. The frontend renders it as a QR code.
- The response `mode` tells the frontend what to do next:
  - `manual` (default in production): the customer pays, then submits the 12-digit UTR to `POST /payments/{id}/utr`. The payment stays `pending` until an admin confirms or rejects it.
  - `mock` (local development): the frontend can call `POST /payments` to settle immediately.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `201` | Pending payment with UPI link. | `PaymentResponseDto` |
| `400` | Cart is empty, a product is unavailable, or stock is insufficient. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |

**Response `201`**

```json
{
  "id": 7,
  "cartId": 4,
  "upiId": "yourupi@bank",
  "amount": 4999.98,
  "status": "pending",
  "createdAt": "2026-01-15T10:35:00.000Z",
  "upiLink": "upi://pay?pa=yourupi@bank&am=4999.98&cu=INR&pn=Purelis&tn=Order+payment",
  "utr": null,
  "failureReason": null,
  "reviewedAt": null,
  "mode": "manual"
}
```

---

## Payments

Payments are controlled by `PAYMENT_MODE`:

- `manual` (recommended and the default in `.env.example`): the customer pays the real UPI ID, submits the 12-digit UTR, and an admin verifies it. No order is created until verification succeeds.
- `mock`: local development only. `POST /payments` settles immediately so the order flow can be tested without a real UPI app.

### `POST /payments`

Simulate a UPI payment.

- Access: authenticated; the caller must own the cart.
- **Mock mode only.** Returns `403` when `PAYMENT_MODE=manual`.
- Mock provider behavior: settles the latest pending payment for the cart immediately.
- In one transaction:
  1. product stock is validated and reduced,
  2. an immutable order and order-item snapshot is created,
  3. cart items are cleared,
  4. the payment is marked `success`.
- The order appears immediately in the customer's `GET /orders` history.
- Replace this with a real provider webhook later.

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `cartId` | integer | yes | Minimum 1. | `4` |
| `upiId` | string | no | Max 255 chars, pattern `^[\w.-]+@[\w.-]+$`. Defaults to the existing payment UPI ID, then `UPI_ID`. | `"yourupi@bank"` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `201` | Payment settled and cart cleared. | `PaymentResponseDto` |
| `400` | Cart is empty or has invalid items. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | `PAYMENT_MODE` is not `mock`. | `ErrorResponseDto` |
| `409` | Payment already failed or stock is no longer sufficient. Create a new checkout to retry. | `ErrorResponseDto` |

**Request**

```json
{
  "cartId": 4,
  "upiId": "yourupi@bank"
}
```

**Response `201`**

```json
{
  "id": 7,
  "cartId": 4,
  "upiId": "yourupi@bank",
  "amount": 4999.98,
  "status": "success",
  "createdAt": "2026-01-15T10:35:00.000Z",
  "upiLink": "upi://pay?pa=yourupi@bank&am=4999.98&cu=INR&pn=Purelis&tn=Order+payment",
  "utr": null,
  "failureReason": null,
  "reviewedAt": "2026-01-15T10:35:00.000Z",
  "mode": "mock"
}
```

---

### `POST /payments/webhook`

Provider callback.

- Access: public, but protected by a shared secret.
- Send `x-webhook-secret: <PAYMENT_WEBHOOK_SECRET>` when the secret is configured. The comparison is timing-safe.
- In `manual` mode the webhook is disabled until `PAYMENT_WEBHOOK_SECRET` is set (`403` otherwise). In `mock` mode an empty secret allows unauthenticated calls.
- Wire a real provider (Razorpay/PhonePe) and verify its own signature before production.
- A successful settlement creates the order snapshot in the same transaction as stock reduction and cart clearing.
- Idempotent: replaying `success` for a successful payment returns the same payment without creating another order.

**Headers**

| Name | Required | Description |
|------|----------|-------------|
| `x-webhook-secret` | When configured | Shared secret from `PAYMENT_WEBHOOK_SECRET`. |

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `paymentId` | integer | yes | Minimum 1. | `7` |
| `status` | `"success" \| "failed"` | yes | Must be `success` or `failed`. | `"success"` |
| `providerReference` | string | no | Max 255 chars. | `"pay_RZP_9f2c1"` |
| `signature` | string | no | Accepted for provider compatibility; this endpoint does not verify it. | `"provider-signature"` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Webhook processed idempotently. | `PaymentResponseDto` |
| `400` | Validation failed or the cart is empty. | `ErrorResponseDto` |
| `401` | Invalid webhook secret. | `ErrorResponseDto` |
| `403` | Webhook disabled in manual mode without a configured secret. | `ErrorResponseDto` |
| `404` | Payment not found. | `ErrorResponseDto` |
| `409` | Invalid status transition or insufficient stock. | `ErrorResponseDto` |

**Request**

```json
{
  "paymentId": 7,
  "status": "success",
  "providerReference": "pay_RZP_9f2c1"
}
```

---

### `GET /payments/config`

Get the storefront payment configuration.

- Access: authenticated.
- Returns the UPI ID, payee name, note, active mode, and uploaded QR image URL.
- When `qrImageUrl` is present, the storefront displays that image instead of the generated UPI QR. The manual UTR flow is unchanged.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Payment configuration. | `PaymentConfigResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "upiId": "yourupi@bank",
  "payeeName": "Purelis",
  "note": "Order payment",
  "mode": "manual",
  "qrImageUrl": "/payments/config/qr?v=1767225600000"
}
```

---

### `GET /payments/config/qr`

Get the uploaded payment QR image.

- Access: public, so the `<img>` tag can load it without an Authorization header.
- Returns PNG or JPEG bytes.
- Returns `404` when no image has been uploaded; the frontend then falls back to the generated UPI QR.
- The URL includes a version query (`?v=<timestamp>`), so it can be cached forever.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Payment QR image bytes. | Binary (PNG or JPEG) |
| `404` | No payment QR image has been uploaded. | `ErrorResponseDto` |

---

### `PUT /payments/config/qr`

Upload or replace the payment QR image.

- Access: admin only.
- Accepts a base64 PNG or JPEG data URL, decoded size at most 2 MB.
- This image replaces the generated QR in the customer payment modal. It does not change verification: customers still submit a UTR and an admin still confirms it.
- Use the QR image exported from the UPI app that owns the configured `UPI_ID`.

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `image` | string | yes | Base64 PNG or JPEG data URL; decoded size ≤ 2 MB. | `"data:image/png;base64,iVBORw0KGgo..."` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated payment configuration. | `PaymentConfigResponseDto` |
| `400` | Invalid or oversized image. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |

---

### `DELETE /payments/config/qr`

Remove the uploaded payment QR image.

- Access: admin only.
- Clears the stored image. The storefront falls back to the generated UPI QR.

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Updated payment configuration with `qrImageUrl: null`. | `PaymentConfigResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |

---

### `GET /payments`

List payments for the admin verification queue.

- Access: admin only.
- Newest first.
- Filter by status and search by customer email, payment ID, or UTR.

**Query parameters**

| Name | Type | Required | Validation | Default |
|------|------|----------|------------|---------|
| `page` | integer | no | Minimum 1. | `1` |
| `limit` | integer | no | 1–100. | `20` |
| `status` | `PaymentStatus` | no | `pending`, `success`, or `failed`. | — |
| `search` | string | no | Max 255 chars. Matches customer email, payment ID, or UTR. | — |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Paginated payments. | `PaginatedPaymentsDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "data": [
    {
      "id": 7,
      "cartId": 4,
      "upiId": "yourupi@bank",
      "amount": 4999.98,
      "status": "pending",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "upiLink": "upi://pay?pa=yourupi@bank&am=4999.98&cu=INR&pn=Purelis&tn=Order+payment",
      "utr": "123456789012",
      "failureReason": null,
      "reviewedAt": null,
      "mode": "manual",
      "userId": 4,
      "customerEmail": "member@example.com",
      "itemCount": 2
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### `POST /payments/{id}/utr`

Submit the UPI reference (UTR/RRN) shown in the customer's UPI app.

- Access: authenticated; the caller must own the payment.
- Stores the 12-digit UTR and keeps the payment `pending`.
- Does **not** create an order, reduce stock, or clear the cart.
- UTRs are globally unique; reusing another payment's UTR returns `409`.
- Re-submitting a UTR on the same pending payment is allowed (for example to fix a typo).

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `7` |

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `utr` | string | yes | Exactly 12 digits. | `"123456789012"` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | UTR saved; payment remains pending. | `PaymentResponseDto` |
| `400` | Invalid UTR or the payment is not pending. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Payment belongs to another user. | `ErrorResponseDto` |
| `404` | Payment not found. | `ErrorResponseDto` |
| `409` | The UTR is already used or the payment is already settled. | `ErrorResponseDto` |

**Request**

```json
{
  "utr": "123456789012"
}
```

---

### `POST /payments/{id}/confirm`

Confirm a payment after verifying its UTR against the store bank statement.

- Access: admin only.
- Requires a submitted UTR in `manual` mode (`400` otherwise).
- In one transaction: reduces stock, creates the order and item snapshot, clears the cart, and marks the payment `success`.
- Idempotent for an already successful payment.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `7` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Payment confirmed and order created. | `PaymentResponseDto` |
| `400` | The customer has not submitted a UTR yet. | `ErrorResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | Payment not found. | `ErrorResponseDto` |
| `409` | Payment already rejected or stock is no longer sufficient. | `ErrorResponseDto` |

---

### `POST /payments/{id}/reject`

Reject a pending payment.

- Access: admin only.
- Marks the payment `failed` with an optional reason.
- Does **not** create an order or change stock.
- The cart stays intact so the customer can start a new checkout and retry.
- Rejecting an already failed payment is idempotent; a successful payment cannot be rejected (`409`).

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `7` |

**Body**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `reason` | string | no | Max 255 chars. | `"UTR not found in the store bank statement."` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Payment rejected. | `PaymentResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Admin role required. | `ErrorResponseDto` |
| `404` | Payment not found. | `ErrorResponseDto` |
| `409` | Successful payments cannot be rejected. | `ErrorResponseDto` |

---

### `GET /payments/{id}`

Get payment status.

- Access: authenticated
- Owners and admins can read a payment.
- Poll this endpoint after checkout to observe `pending -> success/failed`.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `7` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Payment. | `PaymentResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Payment belongs to another user. | `ErrorResponseDto` |
| `404` | Payment not found. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "id": 7,
  "cartId": 4,
  "upiId": "yourupi@bank",
  "amount": 4999.98,
  "status": "success",
  "createdAt": "2026-01-15T10:35:00.000Z",
  "upiLink": "upi://pay?pa=yourupi@bank&am=4999.98&cu=INR&pn=Purelis&tn=Order+payment",
  "utr": "123456789012",
  "failureReason": null,
  "reviewedAt": "2026-01-15T10:35:00.000Z",
  "mode": "manual"
}
```

---

## Orders

Orders are created only when a UPI payment settles successfully. Names, unit prices, quantities, and subtotals are stored as an immutable snapshot, so history remains meaningful after catalog edits or product removal.

### `GET /orders`

List order history, newest first.

- Access: authenticated.
- Clients see only their own orders.
- Admins see all orders.
- Search is scoped to the caller: clients search their own orders; admins can search across all customers.

**Query parameters**

| Name | Type | Required | Validation | Default |
|------|------|----------|------------|---------|
| `page` | integer | no | Minimum 1. | `1` |
| `limit` | integer | no | 1–100. | `10` |
| `status` | `OrderStatus` | no | `paid`. | — |
| `search` | string | no | Max 255 chars. Matches customer email, order ID, or product name. | — |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Paginated order history. | `PaginatedOrdersDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |

**Response `200`**

```json
{
  "data": [
    {
      "id": 18,
      "userId": 4,
      "customerEmail": "member@example.com",
      "paymentId": 7,
      "total": 1298,
      "status": "paid",
      "itemCount": 2,
      "createdAt": "2026-11-01T10:30:00.000Z",
      "items": [
        {
          "id": 22,
          "productId": 3,
          "productName": "Calming Green Tea Face Wash",
          "unitPrice": 649,
          "quantity": 2,
          "subtotal": 1298
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### `GET /orders/{id}`

Get one order with its saved item snapshot.

- Access: authenticated.
- Owners and admins can read an order.

**Path parameters**

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | integer | yes | `18` |

**Responses**

| Status | Description | Body |
|--------|-------------|------|
| `200` | Order. | `OrderResponseDto` |
| `401` | Missing, invalid, or expired token. | `ErrorResponseDto` |
| `403` | Order belongs to another user. | `ErrorResponseDto` |
| `404` | Order not found. | `ErrorResponseDto` |

---

## End-to-end flows

### Authentication

1. `POST /auth/register` with `{ email, password }`. The role is always `client`.
2. The response contains `accessToken`.
3. Send `Authorization: Bearer <accessToken>` on protected routes.
4. `GET /auth/me` returns the current user.
5. Admin flows require an admin account created by `npm run seed:admin` or promoted through `PUT /users/{id}`.

### Shopping and checkout

1. `GET /products?page=1&limit=20` to browse active products.
2. `POST /cart/items` with `{ productId, quantity }`.
3. `GET /cart` to review items, subtotals, and total.
4. `POST /cart/checkout` to create a pending payment and receive `upiLink`.
5. The frontend loads `GET /payments/config`. If `qrImageUrl` is present, it shows the admin-uploaded QR image; otherwise it renders `upiLink` as a generated QR. The customer scans and pays with any UPI app.
6. The customer copies the 12-digit UTR/RRN from the UPI app and the frontend calls `POST /payments/{id}/utr`.
7. The payment stays `pending`; the frontend polls `GET /payments/{id}`.
8. An admin verifies the UTR against the bank statement in the admin payments page and calls `POST /payments/{id}/confirm` (or `POST /payments/{id}/reject` with a reason).
9. On confirm: stock is reduced, the cart is cleared, and an immutable order snapshot is created. On reject: no order is created and the cart stays intact for a retry.
10. `GET /orders` shows the customer their complete order history.

---

## Local setup

```bash
cd backend
npm install
docker compose up -d
npm run migration:run
npm run seed:admin
npm run start:dev
```

Payment settings in `.env`:

```env
UPI_ID=yourupi@bank
UPI_PAYEE_NAME=Purelis
UPI_NOTE=Order payment
PAYMENT_MODE=manual
PAYMENT_WEBHOOK_SECRET=
```

Use `PAYMENT_MODE=mock` only for local development. Set a real `UPI_ID` before accepting payments. After logging in as admin, upload the matching payment QR image at `/admin/payments`; it replaces the generated QR at checkout.

The seeded admin uses these local defaults from `.env`:

```env
ADMIN_EMAIL=admin@microcart.local
ADMIN_PASSWORD=ChangeMe123!
```

Change both values before deploying. Swagger UI is available at `http://localhost:3000/docs`.
