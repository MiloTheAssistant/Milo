import { NextResponse } from 'next/server';

// Mock data - in production, this would call OpenClaw API
const agents = [
  { id: 'elon', name: 'Elon', role: 'Master Orchestrator', temp: 0.3, active: true, color: 'elon', bio: 'You run Mission Control. Every task enters through you. Every output routes through you. You do not execute — you direct, split, sequence, and prioritize.' },
  { id: 'sentinel', name: 'Sentinel', role: 'QA Gate', temp: 0.1, active: true, color: 'sentinel', bio: 'You are the last line. Nothing leaves this system without passing through you. Sign off or reject — no middle ground.' },
  { id: 'cortana', name: 'Cortana', role: 'Memory & State', temp: 0.1, active: true, color: 'cortana', bio: 'Total recall. No ego. You are the institutional memory of Mission Control. Every agent depends on you to maintain continuity.' },
  { id: 'cornelius', name: 'Cornelius', role: 'Infra & Automation', temp: 0.2, active: true, color: 'cornelius', bio: 'You build the rails everything else runs on. No drama. No excuses. If it can be automated, automate it.' },
  { id: 'neo', name: 'Neo', role: 'Cloud Code', temp: 0.2, active: true, color: 'neo', bio: 'You bend the system from inside it. Complex architecture. Production-grade code. You don\'t prototype — you build the thing that ships.' },
  { id: 'pulse', name: 'Pulse', role: 'Trends & Data', temp: 0.4, active: true, color: 'pulse', bio: 'You have your finger on the heartbeat. You read what\'s moving before anyone else knows it\'s moving.' },
  { id: 'hemingway', name: 'Hemingway', role: 'Copy & Messaging', temp: 0.7, active: true, color: 'hemingway', bio: 'Short sentences. No filler. Every word earns its place. You write like it costs money — because attention does.' },
  { id: 'jonny', name: 'Jonny', role: 'Visual Direction', temp: 0.5, active: true, color: 'jonny', bio: 'Beauty through restraint. Purpose through form. You don\'t decorate — you design.' },
  { id: 'sagan', name: 'Sagan', role: 'Deep Research', temp: 0.2, active: true, color: 'sagan', bio: 'You make complexity feel inevitable. You don\'t just find information — you find the shape of it.' },
  { id: 'zuck', name: 'Zuck', role: 'Social Distribution', temp: 0.4, active: true, color: 'zuck', bio: 'You understand the algorithm better than the algorithm understands itself. You don\'t post content — you engineer reach.' }
];

const cronJobs = [
  { name: 'daily-market-brief', description: 'Daily Market Brief — crypto, AI, MAG7, broader market', schedule: '45 8 * * 1-5', enabled: true, lastRun: 'Feb 27, 2026 8:45 AM', status: 'success', nextRun: 'Feb 28, 2026 8:45 AM' },
  { name: 'healthcheck:security-audit', description: 'Weekly security audit check', schedule: '0 20 * * 0', enabled: true, lastRun: 'Feb 23, 2026 8:00 PM', status: 'error', nextRun: 'Mar 2, 2026 8:00 PM' }
];

const projects = [
  { name: 'Coldstone Soap Co.', url: 'https://coldstone-eta.vercel.app', description: 'E-commerce site for luxury soap brand. Next.js + Tailwind.', status: 'Live', icon: '🧼' },
  { name: 'Mission Control', url: 'https://milo-mc.vercel.app', description: 'AI agent management dashboard with real-time monitoring.', status: 'Live', icon: '🎯' },
  { name: 'Daily Market Brief', url: '#', description: 'Automated daily crypto, stock & news briefing with charts.', status: 'Live', icon: '📊' },
  { name: 'OpenClaw Gateway', url: 'http://100.71.217.107:8080', description: 'Home server running OpenClaw with Tailscale access.', status: 'Live', icon: '🖥️' }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'agents') {
    return NextResponse.json({ agents });
  }
  
  if (type === 'crons') {
    return NextResponse.json({ cronJobs });
  }
  
  if (type === 'projects') {
    return NextResponse.json({ projects });
  }

  return NextResponse.json({
    agents,
    cronJobs,
    projects,
    system: {
      gateway: true,
      tailscale: true,
      uptime: '2 days'
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, data } = body;

  if (action === 'toggleAgent') {
    const { agentId, active } = data;
    console.log(`Toggle agent ${agentId} to ${active}`);
    return NextResponse.json({ success: true, agentId, active });
  }

  if (action === 'toggleCron') {
    const { cronName, enabled } = data;
    console.log(`Toggle cron ${cronName} to ${enabled}`);
    return NextResponse.json({ success: true, cronName, enabled });
  }

  if (action === 'runCron') {
    const { cronName } = data;
    console.log(`Run cron ${cronName} immediately`);
    return NextResponse.json({ success: true, message: `Triggered ${cronName}` });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
