import { NextResponse } from 'next/server';
import { getTodayQuests, saveTodayQuests, completeDailyQuest } from '@kairox/apex-conductor';

export async function GET() {
  try {
    const quests = getTodayQuests();
    return NextResponse.json({ quests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { easyTitle, mediumTitle, hardTitle } = body;
    const quests = saveTodayQuests(easyTitle, mediumTitle, hardTitle);
    return NextResponse.json({ success: true, quests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { difficulty } = await request.json();
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
       throw new Error('Invalid difficulty level');
    }
    const quests = completeDailyQuest(difficulty);
    return NextResponse.json({ success: true, quests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
