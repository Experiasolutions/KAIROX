import { NextResponse } from 'next/server';
import { apexConductor, getBacklog, completeTask, getTaskStats } from '@kairox/apex-conductor';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats');

  try {
    const tasks = getBacklog();
    
    if (includeStats) {
      const stats = getTaskStats();
      return NextResponse.json({ tasks, stats });
    }
    
    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = apexConductor.triageTask(body);
    return NextResponse.json({ success: true, task: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    completeTask(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
