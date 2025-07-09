import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, CheckCircle2, AlertCircle, XCircle, Clock, Activity } from 'lucide-react';
import { scanApi } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Spinner,
} from '@/components/ui';

export const ScanStatus = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const { data: scanTasks, isLoading, error } = useQuery({
    queryKey: ['scanTasks', jobId],
    queryFn: () => jobId ? scanApi.getScanTasks(jobId) : null,
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if all tasks are completed
      if (data?.every((task: any) => ['completed', 'failed'].includes(task.status))) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'running':
        return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'running':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10';
      case 'running':
        return 'bg-primary/10';
      case 'completed':
        return 'bg-success/10';
      case 'failed':
        return 'bg-destructive/10';
      default:
        return 'bg-muted/30';
    }
  };

  if (!jobId) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No scan specified</h2>
        <p className="text-muted-foreground">
          Please provide a valid scan job ID.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Spinner className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Loading scan tasks...</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                  <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !scanTasks) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tasks not found</h2>
        <p className="text-muted-foreground">
          Could not load scan tasks for this job.
        </p>
      </div>
    );
  }

  const completedTasks = scanTasks.filter(task => task.status === 'completed').length;
  const failedTasks = scanTasks.filter(task => task.status === 'failed').length;
  const runningTasks = scanTasks.filter(task => task.status === 'running').length;
  const pendingTasks = scanTasks.filter(task => task.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <FileSearch className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Scan Status</h1>
          <p className="text-muted-foreground">
            Detailed task execution status for scan #{jobId?.slice(-8)}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{runningTasks}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">{pendingTasks}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{failedTasks}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Real-time status of individual scan tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanTasks.map((task) => (
                  <TableRow key={task.id} className={getStatusBgColor(task.status)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        {task.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status) as any}>
                        {task.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {task.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.startedAt 
                        ? new Date(task.startedAt).toLocaleTimeString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.startedAt && task.completedAt
                        ? `${Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000)}s`
                        : task.startedAt
                        ? `${Math.round((Date.now() - new Date(task.startedAt).getTime()) / 1000)}s`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.error ? (
                        <span className="text-destructive">{task.error}</span>
                      ) : task.status === 'completed' ? (
                        <span className="text-success">Success</span>
                      ) : task.status === 'running' ? (
                        <span className="text-primary">In progress</span>
                      ) : (
                        <span className="text-muted-foreground">Waiting</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};