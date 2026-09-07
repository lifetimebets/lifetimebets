import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ ok: true, service: 'LIFETIMEBETS', oddsConfigured: Boolean(process.env.ODDS_API_KEY) });
}
