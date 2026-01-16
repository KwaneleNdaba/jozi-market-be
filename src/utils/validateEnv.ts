import { cleanEnv, port, str } from "envalid";

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    SECRET_KEY: str({
      desc: "JWT secret key for token signing",
    }),
    AWS_S3_BUCKET_NAME: str({
      desc: "AWS S3 bucket name for file storage",
    }),
    AWS_REGION: str({
      desc: "AWS region for S3",
    }),
    AWS_ACCESS_KEY_ID: str({
      desc: "AWS access key ID",
    }),
    AWS_SECRET_ACCESS_KEY: str({
      desc: "AWS secret access key",
    }),
    REDIS_URL: str({
      desc: "Redis connection URL for rate limiting",
      default: undefined,
    }),
    BREVO_API_KEY: str({
      desc: "Brevo API key for sending emails",
      default: undefined,
    }),
  });
};
