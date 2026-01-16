import { config } from "dotenv";

config({ path: `.env` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, JWT_EXPIRES_IN } =
  process.env;
export const { DB_NAME, DB_HOST, DB_PASSWORD, DB_USER } = process.env;

export const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } =
  process.env;

export const {
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_NOTIFY_URL,
  PAYFAST_RETURN_URL,
  PAYFAST_CANCEL_URL,
  PAYFAST_PAYMENT_URL,
  PAYFAST_STATUS_URL,
  PAYFAST_PASSPHRASE,
  PAYFAST_ENV,
} = process.env;

export const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_URL } =
  process.env;

export const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI } = process.env;

export const { REDIS_URL } = process.env;

export const { BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME } = process.env;
