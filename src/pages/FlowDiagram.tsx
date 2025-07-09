import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitBranch, Target, Search, Shield, FileText, BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

// Custom node types with icons
const nodeTypes = {
  input: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border-2 border-primary">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
    </div>
  ),
  
  process: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border border-border">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-primary" />
        <div className="font-medium text-sm">{data.label}</div>
      </div>
    </div>
  ),
  
  security: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border border-warning">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-warning" />
        <div className="font-medium text-sm">{data.label}</div>
      </div>
    </div>
  ),
  
  output: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border-2 border-success">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-success" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
    </div>
  ),
  
  analysis: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border border-accent-foreground">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-accent-foreground" />
        <div className="font-medium text-sm">{data.label}</div>
      </div>
    </div>
  ),
};

const initialNodes = [
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 25 },
    data: { label: 'Target Input' },
  },
  {
    id: '2',
    type: 'process',
    position: { x: 100, y: 125 },
    data: { label: 'DNS Enumeration' },
  },
  {
    id: '3',
    type: 'process',
    position: { x: 400, y: 125 },
    data: { label: 'Port Scanning' },
  },
  {
    id: '4',
    type: 'process',
    position: { x: 250, y: 200 },
    data: { label: 'Subdomain Discovery' },
  },
  {
    id: '5',
    type: 'security',
    position: { x: 50, y: 300 },
    data: { label: 'Vulnerability Assessment' },
  },
  {
    id: '6',
    type: 'process',
    position: { x: 250, y: 300 },
    data: { label: 'WHOIS Lookup' },
  },
  {
    id: '7',
    type: 'process',
    position: { x: 450, y: 300 },
    data: { label: 'SSL Certificate Analysis' },
  },
  {
    id: '8',
    type: 'security',
    position: { x: 150, y: 400 },
    data: { label: 'Threat Intelligence' },
  },
  {
    id: '9',
    type: 'process',
    position: { x: 350, y: 400 },
    data: { label: 'Geolocation Analysis' },
  },
  {
    id: '10',
    type: 'analysis',
    position: { x: 250, y: 500 },
    data: { label: 'Risk Scoring' },
  },
  {
    id: '11',
    type: 'output',
    position: { x: 250, y: 600 },
    data: { label: 'Final Report' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e1-4', source: '1', target: '4', animated: true },
  { id: 'e2-5', source: '2', target: '5' },
  { id: 'e2-6', source: '2', target: '6' },
  { id: 'e3-7', source: '3', target: '7' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-8', source: '5', target: '8' },
  { id: 'e6-8', source: '6', target: '8' },
  { id: 'e6-9', source: '6', target: '9' },
  { id: 'e7-9', source: '7', target: '9' },
  { id: 'e8-10', source: '8', target: '10' },
  { id: 'e9-10', source: '9', target: '10' },
  { id: 'e10-11', source: '10', target: '11', animated: true },
];

export const FlowDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <GitBranch className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">OSINT Flow Diagram</h1>
          <p className="text-muted-foreground">
            Visual representation of the intelligence gathering pipeline
          </p>
        </div>
      </div>

      {/* Flow Diagram */}
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Intelligence Pipeline</CardTitle>
          <CardDescription>
            This diagram shows the complete OSINT scanning workflow from target input to final report generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] p-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Controls className="bg-card border border-border" />
            <MiniMap 
              className="bg-card border border-border"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'input': return 'hsl(var(--primary))';
                  case 'process': return 'hsl(var(--muted-foreground))';
                  case 'security': return 'hsl(var(--warning))';
                  case 'analysis': return 'hsl(var(--accent-foreground))';
                  case 'output': return 'hsl(var(--success))';
                  default: return 'hsl(var(--muted-foreground))';
                }
              }}
            />
            <Background variant={1 as any} gap={12} size={1} />
          </ReactFlow>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Components</CardTitle>
          <CardDescription>
            Understanding the different stages of the OSINT scanning process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg border border-primary bg-primary/5">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Input</div>
                <div className="text-xs text-muted-foreground">Target sources</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <Search className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Process</div>
                <div className="text-xs text-muted-foreground">Data collection</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg border border-warning bg-warning/5">
              <Shield className="h-4 w-4 text-warning" />
              <div>
                <div className="font-medium text-sm">Security</div>
                <div className="text-xs text-muted-foreground">Threat analysis</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg border border-accent-foreground bg-accent">
              <BarChart3 className="h-4 w-4 text-accent-foreground" />
              <div>
                <div className="font-medium text-sm">Analysis</div>
                <div className="text-xs text-muted-foreground">Risk scoring</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg border border-success bg-success/5">
              <FileText className="h-4 w-4 text-success" />
              <div>
                <div className="font-medium text-sm">Output</div>
                <div className="text-xs text-muted-foreground">Reports</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};