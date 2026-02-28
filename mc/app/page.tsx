'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  temp: number;
  active: boolean;
  color: string;
  status?: string;
  bio?: string;
}

interface Task {
  id: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  updatedAt: string;
  kind: string;
}

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  status: string;
  lastDuration: string;
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

interface Channel {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  status: string;
}

const colorClasses: Record<string, string> = {
  main: 'from-cyan-400 to-cyan-600',
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [discord, setDiscord] = useState<DiscordData | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setAgents(data.agents || []);
      setTasks(data.activeTasks || []);
      setCronJobs(data.cronJobs || []);
      setProjects(data.projects || []);
      setDiscord(data.discord || null);
      setChannels(data.channels || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold tracking-wide">MISSION<span className="text-cyan-400">CONTROL</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-400">{lastUpdated && `Updated ${lastUpdated}`}</span>
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Refresh">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <span className="text-xs text-slate-400 mr-2">{getGreeting()}, Boss</span>
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

              {/* Active Tasks Banner */}
              {tasks.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-cyan-400 font-semibold">Active Tasks In Progress</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-sm">🤖</div>
                          <div>
                            <div className="text-sm font-medium">{task.agent}</div>
                            <div className="text-xs text-slate-400">{task.model}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{task.kind}</div>
                          <div className="text-xs text-cyan-400">{(task.inputTokens + task.outputTokens).toLocaleString()} tokens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                {[
                  { icon: '🤖', label: 'Active Agents', value: agents.filter(a => a.active).length, color: 'cyan' },
                  { icon: '📋', label: 'Cron Jobs', value: cronJobs.filter(c => c.enabled).length, color: 'emerald' },
                  { icon: '📁', label: 'Projects', value: projects.length, color: 'purple' },
                  { icon: '💬', label: 'Discord', value: discord?.connected ? '1' : '0', color: 'indigo' }
                ].map(stat => (
                  <button key={stat.label} onClick={() => setActivePage(stat.label === 'Discord' ? 'discord' : stat.label === 'Cron Jobs' ? 'tasks' : 'agents')} className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 hover:border-cyan-500/50 transition-all text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{stat.icon}</span>
                      <div className={`w-2 h-2 rounded-full bg-${stat.color}-400`}></div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </button>
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
                      <button key={agent.id} onClick={() => setActivePage('agents')} className="w-full flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-br ${colorClasses[agent.color]}`}>{agent.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{agent.name}</div>
                          <div className="text-xs text-slate-400 truncate">{agent.role}</div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${agent.active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Scheduled Tasks</h3>
                    <button onClick={() => setActivePage('tasks')} className="text-xs text-cyan-400 hover:underline">View all</button>
                  </div>
                  <div className="space-y-2">
                    {cronJobs.slice(0, 3).map(cron => (
                      <div key={cron.name} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${cron.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                          <div className="text-sm font-medium truncate">{cron.name}</div>
                        </div>
                        <div className="text-xs text-slate-400">{cron.schedule}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '💬', label: 'Discord', desc: 'Chat', page: 'discord' },
                    { icon: '📋', label: 'Tasks', desc: 'Cron jobs', page: 'tasks' },
                    { icon: '🤖', label: 'Agents', desc: 'Manage', page: 'agents' },
                    { icon: '🌐', label: 'Projects', desc: 'View all', page: 'projects' }
                  ].map(action => (
                    <button key={action.label} onClick={() => setActivePage(action.page)}
                      className="flex items-center gap-3 p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 hover:-translate-y-0.5 transition-all text-left">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-slate-700">{action.icon}</div>
                      <div><div className="text-xs font-semibold">{action.label}</div><div className="text-[10px] text-slate-400">{action.desc}</div></div>
                    </button>
                  ))}
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Temp: {agent.temp}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${agent.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{agent.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS PAGE */}
          {activePage === 'tasks' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Tasks</h2>
                <p className="text-slate-400">Active sessions and scheduled cron jobs</p>
              </div>
              
              {/* Active Sessions */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Active Sessions</h3>
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">🤖</div>
                            <div>
                              <div className="font-medium">{task.agent}</div>
                              <div className="text-xs text-slate-400">{task.id}</div>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div><span className="text-slate-500">Model</span><div className="text-xs">{task.model}</div></div>
                          <div><span className="text-slate-500">Input</span><div className="text-xs">{task.inputTokens.toLocaleString()}</div></div>
                          <div><span className="text-slate-500">Output</span><div className="text-xs">{task.outputTokens.toLocaleString()}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                    <p className="text-slate-400">No active sessions</p>
                  </div>
                )}
              </div>

              {/* Cron Jobs */}
              <div>
                <h3 className="font-semibold mb-4">Cron Jobs</h3>
                <div className="space-y-4">
                  {cronJobs.map(cron => (
                    <div key={cron.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h3 className="font-semibold">{cron.name}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-cyan-400">{cron.schedule}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{cron.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Last Run</div>
                          <div className="text-sm font-medium">{cron.lastRun}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Next Run</div>
                          <div className="text-sm font-medium">{cron.nextRun}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Duration</div>
                          <div className="text-sm font-medium">{cron.lastDuration}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Status</div>
                          <div className={`text-sm font-medium ${cron.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{cron.status === 'success' ? '✓ Success' : '✗ Error'}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cron.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {cron.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
          {['content', 'docs', 'council', 'approvals', 'memory', 'people', 'office', 'team'].includes(activePage) && (
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
