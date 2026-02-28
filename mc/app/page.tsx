'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  temp: number;
  active: boolean;
  color: string;
  bio?: string;
}

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun: string;
  status: string;
  nextRun: string;
}

interface Project {
  name: string;
  url: string;
  description: string;
  status: string;
  icon: string;
}

interface DiscordData {
  connected: boolean;
  appId: string;
  publicKey: string;
  botName: string;
  servers: { name: string; id: string; members: number; channels: number }[];
  status: string;
}

const colorClasses: Record<string, string> = {
  elon: 'from-cyan-400 to-cyan-600', sentinel: 'from-red-400 to-red-600',
  cortana: 'from-purple-400 to-purple-600', cornelius: 'from-teal-400 to-teal-600',
  neo: 'from-blue-400 to-blue-600', pulse: 'from-pink-400 to-pink-500',
  hemingway: 'from-amber-300 to-amber-500', jonny: 'from-orange-400 to-orange-500',
  sagan: 'from-violet-300 to-violet-600', zuck: 'from-teal-300 to-teal-500'
};

const navItems = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'agents', icon: '🤖', label: 'Agents' },
  { id: 'tasks', icon: '📋', label: 'Tasks' },
  { id: 'council', icon: '👑', label: 'Council' },
  { id: 'approvals', icon: '✅', label: 'Approvals' },
  { id: 'discord', icon: '💬', label: 'Discord' },
  { id: 'content', icon: '📄', label: 'Content' },
  { id: 'projects', icon: '📁', label: 'Projects' },
  { id: 'calendar', icon: '📅', label: 'Calendar' },
  { id: 'memory', icon: '🧠', label: 'Memory' },
  { id: 'docs', icon: '📝', label: 'Docs' },
  { id: 'people', icon: '👥', label: 'People' },
  { id: 'office', icon: '🏢', label: 'Office' },
  { id: 'team', icon: '👥', label: 'Team' }
];

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [discord, setDiscord] = useState<DiscordData | null>(null);
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(data => {
      setAgents(data.agents || []);
      setCronJobs(data.cronJobs || []);
      setProjects(data.projects || []);
      setDiscord(data.discord || null);
      setLoading(false);
    }).catch(() => {
      setAgents([
        { id: 'elon', name: 'Elon', role: 'Master Orchestrator', temp: 0.3, active: true, color: 'elon', bio: 'You run Mission Control.' },
        { id: 'sentinel', name: 'Sentinel', role: 'QA Gate', temp: 0.1, active: true, color: 'sentinel', bio: 'Last line.' },
        { id: 'cortana', name: 'Cortana', role: 'Memory', temp: 0.1, active: true, color: 'cortana', bio: 'Total recall.' },
        { id: 'cornelius', name: 'Cornelius', role: 'Infra', temp: 0.2, active: true, color: 'cornelius', bio: 'Builds rails.' },
        { id: 'neo', name: 'Neo', role: 'Cloud', temp: 0.2, active: true, color: 'neo', bio: 'Complex code.' },
        { id: 'pulse', name: 'Pulse', role: 'Trends', temp: 0.4, active: true, color: 'pulse', bio: 'Finger on pulse.' },
        { id: 'hemingway', name: 'Hemingway', role: 'Copy', temp: 0.7, active: true, color: 'hemingway', bio: 'Short sentences.' },
        { id: 'jonny', name: 'Jonny', role: 'Visual', temp: 0.5, active: true, color: 'jonny', bio: 'Beauty.' },
        { id: 'sagan', name: 'Sagan', role: 'Research', temp: 0.2, active: true, color: 'sagan', bio: 'Complexity.' },
        { id: 'zuck', name: 'Zuck', role: 'Social', temp: 0.4, active: true, color: 'zuck', bio: 'Algorithm.' }
      ]);
      setCronJobs([
        { name: 'daily-market-brief', description: 'Daily Market Brief', schedule: '45 8 * * 1-5', enabled: true, lastRun: 'Feb 27, 2026 8:45 AM', status: 'success', nextRun: 'Feb 28, 2026 8:45 AM' },
        { name: 'healthcheck:security-audit', description: 'Weekly security audit', schedule: '0 20 * * 0', enabled: true, lastRun: 'Feb 23, 2026 8:00 PM', status: 'error', nextRun: 'Mar 2, 2026 8:00 PM' }
      ]);
      setProjects([
        { name: 'Coldstone Soap Co.', url: 'https://coldstone-eta.vercel.app', description: 'E-commerce.', status: 'Live', icon: '🧼' },
        { name: 'Mission Control', url: 'https://milo-mc.vercel.app', description: 'AI dashboard.', status: 'Live', icon: '🎯' },
        { name: 'Daily Market Brief', url: '#', description: 'Briefing.', status: 'Live', icon: '📊' },
        { name: 'OpenClaw Gateway', url: 'http://100.71.217.107:8080', description: 'Home server.', status: 'Live', icon: '🖥️' }
      ]);
      setDiscord({
        connected: true,
        appId: '1477080375812423700',
        publicKey: '2b167934f96b82dd73b97df4ac9af7e9b80d73ebfefb41475d1723e253160dd0',
        botName: 'Milo',
        servers: [{ name: 'Milo HQ', id: '1477080375812423700', members: 2, channels: 5 }],
        status: 'online'
      });
      setLoading(false);
    });
  }, []);

  const toggleAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const newActive = !agent.active;
    setAgents(agents.map(a => a.id === agentId ? { ...a, active: newActive } : a));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-cyan-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg text-white">
     -slate-950 {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold tracking-wide">MISSION<span className="text-cyan-400">CONTROL</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400 mr-2">{getGreeting()}, Boss</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-16 bottom-0 left-0 w-56 bg-slate-900 border-r border-slate-800 p-3 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activePage === item.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-3 right-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span>System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-56 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          
          {/* HOME PAGE */}
          {activePage === 'home' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-1">Dashboard</h2>
                <p className="text-slate-400">Everything running smoothly across your AI ecosystem</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                {[
                  { icon: '🤖', label: 'Active Agents', value: agents.filter(a => a.active).length, color: 'cyan' },
                  { icon: '⏰', label: 'Cron Jobs', value: cronJobs.filter(c => c.enabled).length, color: 'emerald' },
                  { icon: '📁', label: 'Projects', value: projects.length, color: 'purple' },
                  { icon: '💬', label: 'Discord', value: discord?.connected ? '1' : '0', color: 'indigo' }
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{stat.icon}</span>
                      <div className={`w-2 h-2 rounded-full bg-${stat.color}-400`}></div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Agents & Activity */}
              <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Active Agents</h3>
                    <button onClick={() => setActivePage('agents')} className="text-xs text-cyan-400 hover:underline">View all</button>
                  </div>
                  <div className="space-y-2">
                    {agents.slice(0, 5).map(agent => (
                      <div key={agent.id} className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-br ${colorClasses[agent.color]}`}>{agent.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{agent.name}</div>
                          <div className="text-xs text-slate-400 truncate">{agent.role}</div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${agent.active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '💬', text: 'Discord Connected', sub: 'Bot added to server', color: 'indigo' },
                      { icon: '📊', text: 'Daily Market Brief', sub: 'Feb 27, 2026 8:45 AM', color: 'emerald' },
                      { icon: '🎯', text: 'Mission Control v1.3', sub: 'Deployed to Vercel', color: 'cyan' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 bg-slate-800/50 rounded-lg">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{item.text}</div>
                          <div className="text-xs text-slate-400">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AGENTS PAGE */}
          {activePage === 'agents' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Agents</h2>
                <p className="text-slate-400">Control your AI agents</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${!agent.active ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br ${colorClasses[agent.color]}`}>{agent.name[0]}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{agent.name}</h3>
                        <div className="text-xs text-slate-400">{agent.role}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={agent.active} onChange={() => toggleAgent(agent.id)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-all">
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4"></div>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{agent.bio}</p>
                    <span className="text-xs text-slate-500">Temp: {agent.temp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRON JOBS PAGE */}
          {activePage === 'tasks' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Cron Jobs</h2>
                <p className="text-slate-400">Scheduled automated tasks</p>
              </div>
              <div className="space-y-4">
                {cronJobs.map(cron => (
                  <div key={cron.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h3 className="font-semibold">{cron.name}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-cyan-400">{cron.schedule}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{cron.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Last Run</div>
                        <div className="text-sm font-medium">{cron.lastRun}</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Next Run</div>
                        <div className="text-sm font-medium">{cron.nextRun}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cron.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cron.status === 'success' ? '✓ Success' : '✗ Error'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cron.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {cron.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISCORD PAGE */}
          {activePage === 'discord' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Discord</h2>
                <p className="text-slate-400">Connected Discord bot status</p>
              </div>
              
              {discord?.connected ? (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-2xl">🤖</div>
                        <div>
                          <h3 className="font-semibold text-lg">{discord.botName}</h3>
                          <div className="text-sm text-emerald-400">● Online</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Connected</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">App ID</div>
                        <div className="text-sm font-mono">{discord.appId}</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Servers</div>
                        <div className="text-sm font-semibold">{discord.servers.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Connected Servers</h3>
                    <div className="space-y-3">
                      {discord.servers.map(server => (
                        <div key={server.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">🏠</div>
                            <div>
                              <div className="text-sm font-medium">{server.name}</div>
                              <div className="text-xs text-slate-400">ID: {server.id}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{server.members} members</div>
                            <div className="text-xs text-slate-400">{server.channels} channels</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-6 text-center">
                  <p className="text-orange-400 mb-2">⚠️ Discord not connected</p>
                  <p className="text-sm text-slate-400">Configure Discord in OpenClaw gateway</p>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS PAGE */}
          {activePage === 'projects' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Projects</h2>
                <p className="text-slate-400">Active deployments</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer"
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-colors block">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-lg">{project.icon}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{project.name}</h3>
                        <div className="text-xs text-cyan-400 truncate">{project.url.replace(/^https?:\/\//, '')}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{project.status}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR PAGE */}
          {activePage === 'calendar' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Calendar</h2>
                <p className="text-slate-400">Your Gmail calendar</p>
              </div>
              <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-6 text-center">
                <p className="text-orange-400 mb-3">⚠️ Calendar needs re-authentication</p>
                <code className="block p-3 bg-slate-800 rounded-lg text-xs text-slate-400">gog auth add milotheassistant@gmail.com --services calendar</code>
              </div>
            </div>
          )}

          {/* OTHER PAGES */}
          {['content', 'docs', 'tasks', 'council', 'approvals', 'memory', 'people', 'office', 'team'].includes(activePage) && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1 capitalize">{activePage.replace('cronjobs', 'Cron Jobs')}</h2>
                <p className="text-slate-400">Coming soon...</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
