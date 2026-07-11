import type { DemoAccount } from "@/lib/demo-auth";
import type { JournalEntry } from "@/lib/demo-journal";

export type ExportPayload = {
  exportedAt: string;
  account: Omit<DemoAccount, "passwordHash">;
  entries: JournalEntry[];
  securityNote: string;
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function stringToBytes(value: string) {
  return new TextEncoder().encode(value);
}

export async function encryptExportPayload(payload: ExportPayload, passphrase: string) {
  if (passphrase.length < 12) {
    throw new Error("Use at least 12 characters for the export passphrase.");
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    stringToBytes(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 210_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const cipherText = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    stringToBytes(JSON.stringify(payload, null, 2)),
  );

  return {
    version: 1,
    algorithm: "AES-GCM",
    keyDerivation: "PBKDF2-SHA-256",
    iterations: 210_000,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    cipherText: bytesToBase64(new Uint8Array(cipherText)),
  };
}

export function downloadJsonFile(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
