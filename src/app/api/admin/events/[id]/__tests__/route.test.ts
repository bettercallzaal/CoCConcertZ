import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { revalidatePath, isAdmin, update, del } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  isAdmin: vi.fn(),
  update: vi.fn(),
  del: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/api-auth", () => ({ isAdmin }));
vi.mock("@/lib/firebase-admin", () => ({
  adminDb: { collection: () => ({ doc: () => ({ update, delete: del }) }) },
}));

import { DELETE, PATCH } from "../route";

const ctx = { params: Promise.resolve({ id: "evt1" }) };
const req = (body?: unknown) =>
  new NextRequest("https://cocconcertz.com/api/admin/events/evt1", {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("admin events/[id] purges the ISR event pages on write", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PATCH (a go-live status flip) writes, then purges", async () => {
    isAdmin.mockReturnValue(true);
    const res = await PATCH(req({ status: "live" }), ctx);
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(update.mock.invocationCallOrder[0]).toBeLessThan(
      revalidatePath.mock.invocationCallOrder[0],
    );
  });

  it("DELETE purges", async () => {
    isAdmin.mockReturnValue(true);
    const res = await DELETE(req(), ctx);
    expect(res.status).toBe(200);
    expect(del).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("a non-admin gets 401 and neither writes nor purges", async () => {
    isAdmin.mockReturnValue(false);
    const res = await PATCH(req({ status: "live" }), ctx);
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("a failed write does not purge", async () => {
    isAdmin.mockReturnValue(true);
    update.mockRejectedValueOnce(new Error("firestore down"));
    await expect(PATCH(req({ status: "live" }), ctx)).rejects.toThrow("firestore down");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
