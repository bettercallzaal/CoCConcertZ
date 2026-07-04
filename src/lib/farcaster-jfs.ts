import { verify as cryptoVerify, createPublicKey } from "crypto";
import { createPublicClient, http, parseAbi } from "viem";
import { optimism } from "viem/chains";

// JSON Farcaster Signature (JFS) verification for Mini App webhook events.
//
// An envelope is { header, payload, signature }, each base64url. The header
// carries { fid, type: "app_key", key: 0x<ed25519 pubkey> }. Verification:
// 1. ed25519-verify signature over `${header}.${payload}` with header.key
// 2. confirm the key is registered to that fid in the Farcaster KeyRegistry
//    on Optimism (state 1 = ADDED)
//
// The registry check is best-effort: if the public RPC is unreachable we
// accept a signature-valid envelope rather than dropping real events
// (result.keyRegistered === null signals "unverified against registry").

const KEY_REGISTRY = "0x00000000Fc1237824fb747aBDE0FF18990E59b7e" as const;
const keyRegistryAbi = parseAbi([
  "function keyDataOf(uint256 fid, bytes key) view returns (uint8 state, uint32 keyType)",
]);

// SPKI DER prefix for a raw ed25519 public key
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export interface JfsHeader {
  fid: number;
  type: string;
  key: string;
}

export interface JfsResult {
  fid: number;
  payload: unknown;
  signatureValid: boolean;
  keyRegistered: boolean | null;
}

function b64urlJson<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function verifySignature(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  keyHex: string
): boolean {
  try {
    const raw = Buffer.from(keyHex.replace(/^0x/, ""), "hex");
    if (raw.length !== 32) return false;
    const keyObject = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
      format: "der",
      type: "spki",
    });
    const data = Buffer.from(`${headerB64}.${payloadB64}`, "utf8");
    const sig = Buffer.from(signatureB64, "base64url");
    return cryptoVerify(null, data, keyObject, sig);
  } catch {
    return false;
  }
}

async function isKeyRegistered(fid: number, keyHex: string): Promise<boolean | null> {
  try {
    const client = createPublicClient({ chain: optimism, transport: http() });
    const [state] = await client.readContract({
      address: KEY_REGISTRY,
      abi: keyRegistryAbi,
      functionName: "keyDataOf",
      args: [BigInt(fid), keyHex.startsWith("0x") ? (keyHex as `0x${string}`) : (`0x${keyHex}` as `0x${string}`)],
    });
    return state === 1; // 1 = ADDED
  } catch {
    return null; // RPC unavailable - caller decides
  }
}

export async function verifyJfs(envelope: {
  header?: string;
  payload?: string;
  signature?: string;
}): Promise<JfsResult | null> {
  if (!envelope.header || !envelope.payload || !envelope.signature) return null;

  const header = b64urlJson<JfsHeader>(envelope.header);
  const payload = b64urlJson<unknown>(envelope.payload);
  if (!header?.fid || !header?.key || payload === null) return null;

  const signatureValid = verifySignature(
    envelope.header,
    envelope.payload,
    envelope.signature,
    header.key
  );
  if (!signatureValid) {
    return { fid: header.fid, payload, signatureValid: false, keyRegistered: null };
  }

  const keyRegistered = await isKeyRegistered(header.fid, header.key);
  return { fid: header.fid, payload, signatureValid: true, keyRegistered };
}
