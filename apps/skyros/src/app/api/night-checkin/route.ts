import { NextResponse } from 'next/server';
import { saveNightCheckin, getRecentCheckins } from '@kairox/apex-conductor';

export async function GET() {
  try {
    const checkins = getRecentCheckins();
    return NextResponse.json({ checkins });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = saveNightCheckin(body);
    return NextResponse.json({ success: true, streak: result.streak });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
