import { NextRequest, NextResponse } from "next/server";
import { config as siteConfig } from "../../../../../concertz.config";
import { checkTokenBalance } from "@/lib/tokenGate";

export async function POST(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { walletAddress?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { walletAddress } = body;
  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const { tokenAddress, minBalance } = siteConfig.archive.tokenGate;
  if (!tokenAddress) {
    return NextResponse.json(
      { error: "Token gate not configured" },
      { status: 500 }
    );
  }

  try {
    const { eligible, balance } = await checkTokenBalance(
      walletAddress,
      tokenAddress,
      minBalance
    );

    return NextResponse.json({
      eligible,
      balance,
      required: minBalance,
      token: "ZABAL",
      chain: "Base",
    });
  } catch (err) {
    console.error("Token gate check error:", err);
    return NextResponse.json(
      { error: "Failed to check token balance" },
      { status: 500 }
    );
  }
}
