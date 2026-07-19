export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isProduction() {
  return process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
}

export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name] || "";
}
