import type { PaymentMode } from '../payments/payment-mode';

const UPI_ID_PATTERN = /^[\w.-]+@[\w.-]+$/;

function readPaymentMode(): PaymentMode {
  const value = (process.env.PAYMENT_MODE ?? 'manual').trim().toLowerCase();

  if (value !== 'mock' && value !== 'manual') {
    throw new Error('PAYMENT_MODE must be either "mock" or "manual"');
  }

  return value;
}

function readUpiId(): string {
  const value = (process.env.UPI_ID ?? 'yourupi@bank').trim();

  if (!UPI_ID_PATTERN.test(value)) {
    throw new Error('UPI_ID must be a valid UPI ID such as name@bank');
  }

  return value;
}

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'change-me',
    name: process.env.DB_NAME ?? 'microcart',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  limits: {
    maxProducts: parseInt(process.env.MAX_PRODUCTS ?? '100', 10),
    maxClients: parseInt(process.env.MAX_CLIENTS ?? '1000', 10),
  },
  payments: {
    mode: readPaymentMode(),
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? '',
  },
  upi: {
    id: readUpiId(),
    payeeName: process.env.UPI_PAYEE_NAME ?? 'Purelis',
    note: process.env.UPI_NOTE ?? 'Order payment',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@microcart.local',
    password: process.env.ADMIN_PASSWORD ?? 'ChangeMe123!',
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
});
