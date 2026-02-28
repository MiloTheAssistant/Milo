import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // Fetch sessions (active tasks)
  let sessions = { sessions: [], count: 0 };
  let cronJobs = { jobs: [], total: 0 };
  let agents = { agents: [] };
  let channels = { channels: [] };

  try {
    const sessionsRes = await fetch('http://127.0.0.1:18789/json/sessions?active=true', {
      headers: { 'Authorization': 'Bearer 3574b565d259121bcd25767df324e35faa8aac48fa7a00d8' }
    });
    if (sessionsRes.ok) sessions = await sessionsRes.json();
  } catch (e) { console.log('Sessions not available'); }

  try {
    const cronRes = await fetch('http://127.0.0.1:18789/json/cron/list', {
      headers: { 'Authorization': 'Bearer 3574b565d259121bcd25767df324e35faa8aac48fa7a00d8' }
    });
    if (cronRes.ok) cronJobs = await cronRes.json();
  } catch (e) { console.log('Cron not available'); }

  try {
    const agentsRes = await fetch('http://127.0.0.1:18789/json/agents', {
      headers: { 'Authorization': 'Bearer 3574b565d259121bcd25767df324e35faa8aac48fa7a00d8' }
    });
    if (agentsRes.ok) agents = await agentsRes.json();
  } catch (e) { console.log('Agents not available'); }

  try {
    const channelsRes = await fetch('http://127.0.0.1:18789/json/channels', {
      headers: { 'Authorization': 'Bearer 3574b565d259121bcd25767df324e35faa8aac48fa7a00d8' }
    });
    if (channelsRes.ok) channels = await channelsRes.json();
  } catch (e) { console.log('Channels not available'); }

  // Format agents for display - ALL 10 agents from agent system
  const agentsList = [
    { id: 'main', name: 'Milo', role: 'Executive Assistant', temp: 0.3, active: true, color: 'cyan', status: 'online', bio: 'Main executive AI assistant powered by OpenClaw. Direct, competent, and focused on execution.' },
    { id: 'elon', name: 'Elon', role: 'Master Orchestrator', temp: 0.3, active: true, color: 'cyan', status: 'idle', bio: 'You run Mission Control. Every task enters through you. Every output routes through you. You do not execute — you direct, split, sequence, and prioritize.' },
    { id: 'sentinel', name: 'Sentinel', role: 'QA Gate', temp: 0.1, active: true, color: 'red', status: 'idle', bio: 'You are the last line. Nothing leaves this system without passing through you. Sign off or reject — no middle ground.' },
    { id: 'cortana', name: 'Cortana', role: 'Memory & State', temp: 0.1, active: true, color: 'purple', status: 'idle', bio: 'Total recall. No ego. You are the institutional memory of Mission Control. Every agent depends on you to maintain continuity.' },
    { id: 'cornelius', name: 'Cornelius', role: 'Infra & Automation', temp: 0.2, active: true, color: 'teal', status: 'idle', bio: 'You build the rails everything else runs on. No drama. No excuses. If it can be automated, automate it.' },
    { id: 'neo', name: 'Neo', role: 'Cloud Code', temp: 0.2, active: true, color: 'blue', status: 'idle', bio: 'You bend the system from inside it. Complex architecture. Production-grade code. You don\'t prototype — you build the thing that ships.' },
    { id: 'pulse', name: 'Pulse', role: 'Trends & Data', temp: 0.4, active: true, color: 'pink', status: 'idle', bio: 'You have your finger on the heartbeat. You read what\'s moving before anyone else knows it\'s moving.' },
    { id: 'hemingway', name: 'Hemingway', role: 'Copy & Messaging', temp: 0.7, active: true, color: 'amber', status: 'idle', bio: 'Short sentences. No filler. Every word earns its place. You write like it costs money — because attention does.' },
    { id: 'jonny', name: 'Jonny', role: 'Visual Direction', temp: 0.5, active: true, color: 'orange', status: 'idle', bio: 'Beauty through restraint. Purpose through form. You don\'t decorate — you design.' },
    { id: 'sagan', name: 'Sagan', role: 'Deep Research', temp: 0.2, active: true, color: 'violet', status: 'idle', bio: 'You make complexity feel inevitable. You don\'t just find information — you find the shape of it.' },
    { id: 'zuck', name: 'Zuck', role: 'Social Distribution', temp: 0.4, active: true, color: 'teal', status: 'idle', bio: 'You understand the algorithm better than the algorithm understands itself. You don\'t post content — you engineer reach.' }
  ];

  // Format cron jobs for display
  const cronJobsList = (cronJobs.jobs || []).map((job: any) => ({
    name: job.name,
    description: job.description || job.name,
    schedule: job.schedule?.expr || 'N/A',
    enabled: job.enabled,
    lastRun: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString() : 'Never',
    nextRun: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString() : 'N/A',
    status: job.state?.lastStatus === 'ok' ? 'success' : 'error',
    lastDuration: job.state?.lastDurationMs ? `${Math.round(job.state.lastDurationMs / 1000)}s` : 'N/A'
  }));

  // Format active sessions (tasks in progress)
  const activeTasks = (sessions.sessions || []).map((s: any) => ({
    id: s.sessionId,
    agent: s.agentId || 'main',
    model: s.model || 'Unknown',
    inputTokens: s.inputTokens || 0,
    outputTokens: s.outputTokens || 0,
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'Unknown',
    kind: s.kind || 'direct'
  }));

  // Format channels
  const channelsList = (channels.channels || []).map((ch: any) => ({
    id: ch.id,
    name: ch.name || ch.provider,
    provider: ch.provider,
    enabled: ch.enabled,
    status: ch.status || 'unknown'
  }));

  const discord = {
    connected: channelsList.some((c: any) => c.provider === 'discord'),
    appId: '1477080375812423700',
    publicKey: '2b167934f96b82dd73b97df4ac9af7e9b80d73ebfefb41475d1723e253160dd0',
    botName: 'Milo',
    servers: [{ name: 'Milo HQ', id: '1477080375812423700', members: 2, channels: 5 }],
    status: channelsList.some((c: any) => c.provider === 'discord') ? 'online' : 'offline'
  };

  const projects = [
    { name: 'Coldstone Soap Co.', url: 'https://coldstone-eta.vercel.app', description: 'E-commerce site for luxury soap brand', status: 'Live', icon: '🧼' },
    { name: 'Mission Control', url: 'https://milo-mc.vercel.app', description: 'AI agent management dashboard', status: 'Live', icon: '🎯' },
    { name: 'Daily Market Brief', url: '#', description: 'Automated daily crypto & stock briefing', status: 'Live', icon: '📊' },
    { name: 'OpenClaw Gateway', url: 'http://100.71.217.107:18789', description: 'Home server with Tailscale access', status: 'Live', icon: '🖥️' }
  ];

  if (type === 'tasks') return NextResponse.json({ tasks: activeTasks, cronJobs: cronJobsList });
  if (type === 'agents') return NextResponse.json({ agents: agentsList });
  if (type === 'crons') return NextResponse.json({ cronJobs: cronJobsList });
  if (type === 'projects') return NextResponse.json({ projects });
  if (type === 'discord') return NextResponse.json({ discord });
  if (type === 'channels') return NextResponse.json({ channels: channelsList });

  return NextResponse.json({ 
    agents: agentsList, 
    cronJobs: cronJobsList, 
    projects, 
    discord,
    channels: channelsList,
    activeTasks,
    system: { gateway: true, tailscale: true }
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
