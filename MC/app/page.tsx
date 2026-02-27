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

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setAgents(data.agents || []);
      setCronJobs(data.cronJob || []);
      setProjects(data.projects || []);
    } catch (e) {
      // Fallback data
      setAgents([
        { id: 'elon', name: 'Elon', role: 'Master Orchestrator', temp: 0.3, active: true, color: 'elon', bio: 'You run Mission Control. Every task enters through you.' },
        { id: 'sentinel', name: 'Sentinel', role: 'QA Gate', temp: 0.1, active: true, color: 'sentinel', bio: 'You are the last line.' },
        { id: 'cortana', name: 'Cortana', role: 'Memory & State', temp: 0.1, active: true, color: 'cortana', bio: 'Total recall.' },
        { id: 'cornelius', name: 'Cornelius', role: 'Infra & Automation', temp: 0.2, active: true, color: 'cornelius', bio: 'You build the rails.' },
        { id: 'neo', name: 'Neo', role: 'Cloud Code', temp: 0.2, active: true, color: 'neo', bio: 'Complex architecture.' },
        { id: 'pulse', name: 'Pulse', role: 'Trends & Data', temp: 0.4, active: true, color: 'pulse', bio: 'Finger on the heartbeat.' },
        { id: 'hemingway', name: 'Hemingway', role: 'Copy & Messaging', temp: 0.7, active: true, color: 'hemingway', bio: 'Short sentences.' },
        { id: 'jonny', name: 'Jonny', role: 'Visual Direction', temp: 0.5, active: true, color: 'jonny', bio: 'Beauty through restraint.' },
        { id: 'sagan', name: 'Sagan', role: 'Deep Research', temp: 0.2, active: true, color: 'sagan', bio: 'Make complexity inevitable.' },
        { id: 'zuck', name: 'Zuck', role: 'Social Distribution', temp: 0.4, active: true, color: 'zuck', bio: 'Understand the algorithm.' }
      ]);
      setCronJobs([
        { name: 'daily-market-brief', description: 'Daily Market Brief', schedule: '45 8 * * 1-5', enabled: true, lastRun: 'Feb 27, 2026 8:45 AM', status: 'success', nextRun: 'Feb 28, 2026 8:45 AM' },
        { name: 'healthcheck:security-audit', description: 'Weekly security audit', schedule: '0 20 * * 0', enabled: true, lastRun: 'Feb 23, 2026 8:00 PM', status: 'error', nextRun: 'Mar 2, 2026 8:00 PM' }
      ]);
      setProjects([
        { name: 'Coldstone Soap Co.', url: 'https://coldstone-eta.vercel.app', description: 'E-commerce site.', status: 'Live', icon: '🧼' },
        { name: 'Mission Control', url: 'https://milo-mc.vercel.app', description: 'AI agent dashboard.', status: 'Live', icon: '🎯' },
        { name: 'Daily Market Brief', url: '#', description: 'Automated briefing.', status: 'Live', icon: '📊' },
        { name: 'OpenClaw Gateway', url: 'http://100.71.217.107:8080', description: 'Home server.', status: 'Live', icon: '🖥️' }
      ]);
    }
    setLoading(false);
  };

  const toggleAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const newActive = !agent.active;
    setAgents(agents.map(a => a.id === agentId ? { ...a, active: newActive } : a));
    
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleAgent', data: { agentId, active: newActive } })
      });
    } catch (e) {
      console.log('API not available');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const colorClasses: Record<string, string> = {
    elon: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
    sentinel: 'bg-gradient-to-br from-red-400 to-red-500',
    cortana: 'bg-gradient-to-br from-purple-400 to-purple-600',
    cornelius: 'bg-gradient-to-br from-teal-400 to-teal-600',
    neo: 'bg-gradient-to-br from-blue-400 to-blue-600',
    pulse: 'bg-gradient-to-br from-pink-400 to-pink-500',
    hemingway: 'bg-gradient-to-br from-amber-300 to-amber-500',
    jonny: 'bg-gradient-to-br from-orange-400 to-orange-500',
    sagan: 'bg-gradient-to-br from-violet-300 to-violet-600',
    zuck: 'bg-gradient-to-br from-teal-300 to-teal-500'
  };

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'tasks', icon: '📋', label: 'Tasks' },
    { id: 'agents', icon: '🤖', label: 'Agents' },
    { id: 'content', icon: '📄', label: 'Content' },
    { id: 'approvals', icon: '✅', label: 'Approvals' },
    { id: 'council', icon: '👑', label: 'Council' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'projects', icon: '📁', label: 'Projects' },
    { id: 'memory', icon: '🧠', label: 'Memory' },
    { id: 'docs', icon: '📝', label: 'Docs' },
    { id: 'people', icon: '👥', label: 'People' },
    { id: 'office', icon: '🏢', label: 'Office' },
    { id: 'team', icon: '👥', label: 'Team' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-cyan-400">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-[#16161f] border border-[#2a2a3a] flex items-center justify-center text-xl"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#12121a] border-r border-[#2a2a3a] p-4 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="border-b border-[#2a2a3a] pb-4 mb-4">
          <h1 className="text-base font-bold tracking-wider uppercase">Mission Control</h1>
          <span className="text-xs text-cyan-400 tracking-widest uppercase">Agent System</span>
        </div>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === item.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-500/50 text-white' 
                  : 'text-[#8888a0] hover:bg-[#1a1a24] hover:border-[#2a2a3a]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* HOME PAGE */}
        {activePage === 'home' && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-7">
              <p className="text-xs text-cyan-400 tracking-widest uppercase mb-1">{getGreeting()}, Boss</p>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">Mission Control</h1>
              <p className="text-[#8888a0] text-sm">Everything running smoothly across your AI ecosystem</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
                <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center text-lg mb-3">🤖</div>
                <div className="text-2xl font-bold">{agents.filter(a => a.active).length}</div>
                <div className="text-xs text-[#8888a0]">Active Agents</div>
              </div>
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
                <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center text-lg mb-3">⏰</div>
                <div className="text-2xl font-bold">{cronJobs.filter(c => c.enabled).length}</div>
                <div className="text-xs text-[#8888a0]">Cron Jobs</div>
              </div>
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-400"></div>
                <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center text-lg mb-3">🌐</div>
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-xs text-[#8888a0]">Deployments</div>
              </div>
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-400"></div>
                <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center text-lg mb-3">⚡</div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-xs text-[#8888a0]">Services</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mb-5">
              {/* Active Agents */}
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">🤖 Active Agents</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">All Online</span>
                </div>
                <div className="space-y-2">
                  {agents.slice(0, 6).map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => setActivePage('agents')}
                      className="w-full flex items-center gap-3 p-3 bg-[#1a1a24] rounded-xl hover:bg-[#12121a] transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colorClasses[agent.color]}`}>
                        {agent.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{agent.name}</div>
                        <div className="text-[10px] text-[#8888a0]">{agent.role}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${agent.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#2a2a3a] text-[#55556a]'}`}>
                        {agent.active ? 'Online' : 'Offline'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4">📡 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#1a1a24] rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5"></div>
                    <div>
                      <div className="text-xs font-medium">Mission Control v1.2 Deployed</div>
                      <div className="text-[10px] text-[#8888a0]">Live at milo-mc.vercel.app</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#1a1a24] rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
                    <div>
                      <div className="text-xs font-medium">Daily Market Brief</div>
                      <div className="text-[10px] text-[#8888a0]">Feb 27, 2026 8:45 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#1a1a24] rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></div>
                    <div>
                      <div className="text-xs font-medium">Coldstone Website</div>
                      <div className="text-[10px] text-[#8888a0]">Deployed to Vercel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold mb-3">⚡ Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: '📋', label: 'Tasks', desc: 'Cron jobs', color: 'bg-purple-500' },
                  { icon: '🤖', label: 'Agents', desc: 'Manage', color: 'bg-orange-500' },
                  { icon: '🌐', label: 'Projects', desc: 'View all', color: 'bg-emerald-500' },
                  { icon: '📅', label: 'Calendar', desc: 'Schedule', color: 'bg-cyan-500' }
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => setActivePage(action.label.toLowerCase())}
                    className="flex items-center gap-3 p-3.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl hover:border-cyan-500/50 hover:-translate-y-0.5 transition-all text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${action.color}`}>{action.icon}</div>
                    <div>
                      <div className="text-xs font-semibold">{action.label}</div>
                      <div className="text-[10px] text-[#8888a0]">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-7 pt-4 border-t border-[#2a2a3a] text-xs text-[#8888a0]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]"></div>
                <span>Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                <span>Tailscale</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]"></div>
                <span>{agents.filter(a => a.active).length} Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]"></div>
                <span>{cronJobs.filter(c => c.enabled).length} Cron</span>
              </div>
            </div>
          </div>
        )}

        {/* TASKS PAGE */}
        {activePage === 'tasks' && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Tasks</h2>
              <p className="text-sm text-[#8888a0]">Scheduled cron jobs and automated tasks.</p>
            </div>
            <div className="space-y-4">
              {cronJobs.map(cron => (
                <div key={cron.name} className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{cron.name}</h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400">{cron.schedule}</span>
                  </div>
                  <p className="text-xs text-[#8888a0] mb-3">{cron.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a24] p-2.5 rounded-lg">
                      <div className="text-[10px] text-[#55556a] uppercase mb-1">Last Run</div>
                      <div className="text-xs font-semibold">{cron.lastRun}</div>
                    </div>
                    <div className="bg-[#1a1a24] p-2.5 rounded-lg">
                      <div className="text-[10px] text-[#55556a] uppercase mb-1">Next Run</div>
                      <div className="text-xs font-semibold">{cron.nextRun}</div>
                    </div>
                    <div className="bg-[#1a1a24] p-2.5 rounded-lg">
                      <div className="text-[10px] text-[#55556a] uppercase mb-1">Status</div>
                      <div className={`text-xs font-semibold ${cron.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {cron.status === 'success' ? '✓ Success' : '✗ Error'}
                      </div>
                    </div>
                    <div className="bg-[#1a1a24] p-2.5 rounded-lg">
                      <div className="text-[10px] text-[#55556a] uppercase mb-1">Enabled</div>
                      <div className="text-xs font-semibold">{cron.enabled ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS PAGE */}
        {activePage === 'agents' && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Agents</h2>
              <p className="text-sm text-[#8888a0]">Control your AI agents — toggle active status and view temperature settings.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className={`bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 ${!agent.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${colorClasses[agent.color]}`}>
                      {agent.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <div className="text-xs text-[#8888a0]">{agent.role}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={agent.active} onChange={() => toggleAgent(agent.id)} className="sr-only peer" />
                      <div className="w-10 h-5.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#8888a0] rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-white"></div>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-[#8888a0] mb-3 line-clamp-2">{agent.bio}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1a1a24] text-[#8888a0]">Temp: {agent.temp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS PAGE */}
        {activePage === 'projects' && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Projects</h2>
              <p className="text-sm text-[#8888a0]">Active deployments and web properties.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {projects.map(project => (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 hover:border-cyan-500/50 transition-colors block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-lg">{project.icon}</div>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <div className="text-xs text-cyan-400">{project.url.replace(/^https?:\/\//, '')}</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#8888a0] mb-3">{project.description}</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {project.status}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR PAGE */}
        {activePage === 'calendar' && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Calendar</h2>
              <p className="text-sm text-[#8888a0]">Your Gmail calendar events.</p>
            </div>
            <div className="bg-[#16161f] border border-orange-500/30 rounded-xl p-6 text-center">
              <p className="text-orange-400 mb-3">⚠️ Calendar needs re-authentication</p>
              <code className="block p-3 bg-[#1a1a24] rounded-lg text-xs text-[#8888a0]">
                gog auth add milotheassistant@gmail.com --services calendar
              </code>
            </div>
          </div>
        )}

        {/* Placeholder Pages */}
        {['content', 'approvals', 'council', 'memory', 'docs', 'people', 'office', 'team'].includes(activePage) && (
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold capitalize">{activePage}</h2>
              <p className="text-sm text-[#8888a0]">Coming soon...</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a3a] bg-[#12121a] flex items-center justify-between text-xs text-[#55556a]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span>System Online</span>
          </div>
          <span>Mission Control v1.2</span>
        </div>
      </main>
    </div>
  );
}
