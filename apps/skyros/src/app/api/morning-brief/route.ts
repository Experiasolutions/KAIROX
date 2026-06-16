import { NextResponse } from 'next/server';
import { getTodayBrief, saveMorningBrief, getUserStats } from '@kairox/apex-conductor';

export async function GET() {
  try {
    const brief = getTodayBrief();
    const userStats = getUserStats();
    return NextResponse.json({ brief, userStats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    saveMorningBrief(body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
