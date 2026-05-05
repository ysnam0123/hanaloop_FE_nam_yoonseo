import { type NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  return Response.json({ ok: true });
}
