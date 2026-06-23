import dotenv from "dotenv";

dotenv.config();

const toBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

export const config = {
  server: {
    port: Number(process.env.PORT ?? 3000),
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    allowCorsCredentials: toBoolean(process.env.ALLOW_CORS_CREDENTIALS, false),
  },
  engine: {
    disablePlayOrder: toBoolean(process.env.DISABLE_PLAY_ORDER, false),
    autoPromoteToQueen: toBoolean(process.env.AUTO_PROMOTE_TO_QUEEN, false),
  },
};
