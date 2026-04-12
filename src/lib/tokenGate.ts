import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export async function checkTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  minBalance: string
): Promise<{ eligible: boolean; balance: string }> {
  const balance = await client.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [walletAddress as `0x${string}`],
  });

  const balanceStr = balance.toString();
  const eligible = balance >= BigInt(minBalance);

  return { eligible, balance: balanceStr };
}
