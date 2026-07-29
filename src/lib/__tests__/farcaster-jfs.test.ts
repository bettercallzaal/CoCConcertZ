import { describe, it, expect } from "vitest";
import { createPrivateKey, createPublicKey, sign as cryptoSign, generateKeyPairSync } from "crypto";
import { verifySignature } from "../farcaster-jfs";

// Generate a real ed25519 keypair once for the test suite.
const { privateKey, publicKey } = generateKeyPairSync("ed25519");

// Export the raw 32-byte public key as a hex string (as Farcaster uses it).
function rawPublicKeyHex(pubKey: ReturnType<typeof createPublicKey>): string {
  const der = pubKey.export({ type: "spki", format: "der" }) as Buffer;
  // SPKI DER for ed25519: 12-byte prefix + 32-byte key
  return der.subarray(12).toString("hex");
}

function makeSignature(headerB64: string, payloadB64: string): string {
  const data = Buffer.from(`${headerB64}.${payloadB64}`, "utf8");
  const sig = cryptoSign(null, data, privateKey);
  return sig.toString("base64url");
}

const HEADER = Buffer.from(JSON.stringify({ fid: 1, type: "app_key", key: "0x" + rawPublicKeyHex(publicKey) })).toString("base64url");
const PAYLOAD = Buffer.from(JSON.stringify({ event: "miniapp_added" })).toString("base64url");

describe("verifySignature", () => {
  it("accepts a valid ed25519 signature", () => {
    const sig = makeSignature(HEADER, PAYLOAD);
    const keyHex = "0x" + rawPublicKeyHex(publicKey);
    expect(verifySignature(HEADER, PAYLOAD, sig, keyHex)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const sig = makeSignature(HEADER, PAYLOAD);
    const tampered = Buffer.from(JSON.stringify({ event: "miniapp_removed" })).toString("base64url");
    const keyHex = "0x" + rawPublicKeyHex(publicKey);
    expect(verifySignature(HEADER, tampered, sig, keyHex)).toBe(false);
  });

  it("rejects a tampered header", () => {
    const sig = makeSignature(HEADER, PAYLOAD);
    const tamperedHeader = Buffer.from(JSON.stringify({ fid: 999, type: "app_key", key: "0x" + rawPublicKeyHex(publicKey) })).toString("base64url");
    const keyHex = "0x" + rawPublicKeyHex(publicKey);
    expect(verifySignature(tamperedHeader, PAYLOAD, sig, keyHex)).toBe(false);
  });

  it("rejects a signature from a different key", () => {
    const { privateKey: otherPrivKey, publicKey: otherPubKey } = generateKeyPairSync("ed25519");
    const sigFromOther = cryptoSign(null, Buffer.from(`${HEADER}.${PAYLOAD}`, "utf8"), otherPrivKey).toString("base64url");
    const keyHex = "0x" + rawPublicKeyHex(publicKey); // original key, not the other one
    expect(verifySignature(HEADER, PAYLOAD, sigFromOther, keyHex)).toBe(false);
  });

  it("rejects a key that is not 32 bytes long", () => {
    const sig = makeSignature(HEADER, PAYLOAD);
    expect(verifySignature(HEADER, PAYLOAD, sig, "0xdeadbeef")).toBe(false);
  });

  it("rejects a completely bogus signature string", () => {
    const keyHex = "0x" + rawPublicKeyHex(publicKey);
    expect(verifySignature(HEADER, PAYLOAD, "not-a-real-sig", keyHex)).toBe(false);
  });

  it("rejects an empty signature", () => {
    const keyHex = "0x" + rawPublicKeyHex(publicKey);
    expect(verifySignature(HEADER, PAYLOAD, "", keyHex)).toBe(false);
  });

  it("accepts a key hex without 0x prefix", () => {
    const sig = makeSignature(HEADER, PAYLOAD);
    const keyHex = rawPublicKeyHex(publicKey); // no 0x prefix
    expect(verifySignature(HEADER, PAYLOAD, sig, keyHex)).toBe(true);
  });
});
