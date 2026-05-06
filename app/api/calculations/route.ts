import { type NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  return Response.json({ data: [] });
}

export async function POST(_request: NextRequest) {
  return Response.json({ ok: true });
}
