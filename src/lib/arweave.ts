import { TurboFactory } from "@ardrive/turbo-sdk";
import { Readable } from "stream";

let turboClient: ReturnType<typeof TurboFactory.authenticated> | null = null;

function getTurboClient() {
  if (turboClient) return turboClient;

  const jwkString = process.env.ARWEAVE_FUND_WALLET_JWK;
  if (!jwkString) throw new Error("ARWEAVE_FUND_WALLET_JWK not configured");

  const jwk = JSON.parse(jwkString);
  turboClient = TurboFactory.authenticated({ privateKey: jwk });
  return turboClient;
}

export async function uploadToArweave(
  fileBuffer: Buffer,
  contentType: string,
  tags?: { name: string; value: string }[]
): Promise<{ txId: string; gatewayUrl: string }> {
  const turbo = getTurboClient();

  const allTags = [
    { name: "Content-Type", value: contentType },
    { name: "App-Name", value: "COC-Concertz-Archive" },
    { name: "App-Version", value: "1.0.0" },
    ...(tags || []),
  ];

  const response = await turbo.uploadFile({
    fileStreamFactory: () => Readable.from(fileBuffer),
    fileSizeFactory: () => fileBuffer.length,
    dataItemOpts: { tags: allTags },
  });

  const txId = response.id;
  const gatewayUrl = `https://arweave.net/${txId}`;

  return { txId, gatewayUrl };
}

export async function getFundBalance(): Promise<{
  balanceWinc: string;
  balanceAR: number;
}> {
  const turbo = getTurboClient();
  const balance = await turbo.getBalance();
  const balanceWinc = balance.winc;
  const balanceAR = Number(balanceWinc) / 1e12;
  return { balanceWinc, balanceAR };
}
