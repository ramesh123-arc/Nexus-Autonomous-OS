export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  RESEARCHING = 'RESEARCHING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  DEPLOYING = 'DEPLOYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AgentSwarmStep {
  id: string;
  agent: 'Researcher' | 'Strategist' | 'Executor' | 'Distributor';
  prompt: string;
  status: 'idle' | 'running' | 'done';
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: AgentStatus;
  progress: number;
  timestamp: string;
  sources?: GroundingSource[];
  swarmSteps?: AgentSwarmStep[];
  yieldGenerated?: number;
  subTasks?: { id: string; label: string; progress: number; status: 'done' | 'running' | 'idle' }[];
}

export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'security';
  message: string;
  timestamp: string;
}

export enum AIProvider {
  GOOGLE = 'google'
}

export type AppTab = 
  | 'dashboard' 
  | 'tasks' 
  | 'swarms'
  | 'brain'
  | 'visual' 
  | 'content' 
  | 'voice' 
  | 'converters' 
  | 'social' 
  | 'whatsapp' 
  | 'integrations'
  | 'finances'
  | 'vault'
  | 'cloud';

export interface ClusterNode {
  id: string;
  name: string;
  url: string;
  secret: string;
  status: string;
  region: string;
  uptime: string;
  successRate: number;
}

export interface ApiKeyRecord {
  provider: string;
  key: string;
  label: string;
  lastUpdated: string;
  encrypted: boolean;
}

export interface MemoryFragment {
  id: string;
  content: string;
  category: 'preference' | 'insight' | 'technical';
  timestamp: string;
}
