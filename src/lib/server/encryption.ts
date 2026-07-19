import crypto from "node:crypto";
import { requireEnv } from "@/lib/server/env";

const PREFIX = "enc:v1";

function getKey() {
  return crypto.createHash("sha256").update(requireEnv("ENCRYPTION_KEY")).digest();
}

export function encryptText(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptText(value: string) {
  if (!value.startsWith(`${PREFIX}:`)) {
    return value;
  }

  const [, , ivValue, tagValue, dataValue] = value.split(":");

  if (!ivValue || !tagValue || !dataValue) {
    return "";
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
