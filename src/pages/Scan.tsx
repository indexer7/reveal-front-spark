import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Clock, Target, AlertCircle, CheckCircle2, XCircle, Square } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { scanApi } from '@/services/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Spinner,
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

export const Scan = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [isAborting, setIsAborting] = useState(false);

  const { data: scanJob, isLoading, error } = useQuery({
    queryKey: ['scan', jobId],
    queryFn: () => jobId ? scanApi.getScanStatus(jobId) : null,
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling if scan is completed, failed, or aborted
      const data = query.state.data;
      if (data?.status && ['completed', 'failed', 'aborted'].includes(data.status)) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  const abortScan = async () => {
    if (!jobId) return;
    
    try {
      setIsAborting(true);
      await scanApi.abortScan(jobId);
      toast({
        title: 'Scan aborted',
        description: 'The scan has been stopped successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to abort scan',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAborting(false);
    }
  };

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
      case 'aborted':
        return <Square className="h-4 w-4 text-muted-foreground" />;
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
      case 'aborted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning';
      case 'running':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      case 'aborted':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!jobId) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No scan specified</h2>
        <p className="text-muted-foreground">
          Please start a scan from the target selection page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Spinner className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Loading scan details...</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !scanJob) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Scan not found</h2>
        <p className="text-muted-foreground">
          The requested scan could not be found or you don't have access to it.
        </p>
      </div>
    );
  }

  const isRunning = scanJob.status === 'running' || scanJob.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Scan Progress</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of OSINT scan execution
            </p>
          </div>
        </div>
        
        {isRunning && (
          <Button 
            variant="outline" 
            onClick={abortScan}
            disabled={isAborting}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {isAborting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Aborting...
              </>
            ) : (
              'Abort Scan'
            )}
          </Button>
        )}
      </div>

      {/* Scan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Scan #{jobId.slice(-8)}
                {getStatusIcon(scanJob.status)}
              </CardTitle>
              <CardDescription>
                Started {new Date(scanJob.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge 
              variant={getStatusVariant(scanJob.status) as any}
              className={getStatusColor(scanJob.status)}
            >
              {scanJob.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{scanJob.progress}%</span>
            </div>
            <Progress 
              value={scanJob.progress} 
              className="h-3"
            />
          </div>

          {/* Scan Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{scanJob.targets.length}</div>
              <div className="text-sm text-muted-foreground">Targets</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {scanJob.completedAt 
                  ? Math.round((new Date(scanJob.completedAt).getTime() - new Date(scanJob.createdAt).getTime()) / 1000 / 60)
                  : Math.round((Date.now() - new Date(scanJob.createdAt).getTime()) / 1000 / 60)
                }m
              </div>
              <div className="text-sm text-muted-foreground">
                {scanJob.status === 'completed' ? 'Duration' : 'Elapsed'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {scanJob.status === 'running' ? 'ACTIVE' : scanJob.status.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>

          {/* Targets List */}
          <div className="space-y-2">
            <h4 className="font-medium">Targets</h4>
            <div className="space-y-1">
              {scanJob.targets.map((target, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-mono">{target.value}</span>
                  <Badge variant="outline" className="text-xs">
                    {target.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Status Updates */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 animate-pulse" />
              Live Updates
            </CardTitle>
            <CardDescription>
              Real-time scan progress and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Scanning in progress... Updates every 3 seconds
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};