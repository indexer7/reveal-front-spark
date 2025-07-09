import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileText, Download, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { reportsApi } from '@/services/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Spinner,
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

export const Report = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'html'>('pdf');

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', jobId],
    queryFn: () => jobId ? reportsApi.getReportStatus(jobId) : null,
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if report is ready or failed
      if (data?.status && ['ready', 'failed'].includes(data.status)) {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'html') => 
      reportsApi.generateReport(jobId!, format),
    onSuccess: () => {
      toast({
        title: 'Report generation started',
        description: 'Your report is being generated. This may take a few minutes.',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate report',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'html') => 
      reportsApi.downloadReport(jobId!, format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reveal-report-${jobId?.slice(-8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Report downloaded',
        description: `Report saved as ${format.toUpperCase()} file`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerateReport = (format: 'pdf' | 'html') => {
    setDownloadFormat(format);
    generateReportMutation.mutate(format);
  };

  const handleDownloadReport = (format: 'pdf' | 'html') => {
    downloadReportMutation.mutate(format);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'generating':
        return 'outline';
      case 'ready':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
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
          <h1 className="text-2xl font-bold">Loading report status...</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-32 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive OSINT reports for scan #{jobId.slice(-8)}
          </p>
        </div>
      </div>

      {/* Report Status */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Report Status
                  {getStatusIcon(reportData.status)}
                </CardTitle>
                <CardDescription>
                  {reportData.generatedAt 
                    ? `Generated ${new Date(reportData.generatedAt).toLocaleString()}`
                    : 'Report generation status'
                  }
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(reportData.status) as any}>
                {reportData.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Format: {reportData.format.toUpperCase()}</div>
                <div className="text-sm text-muted-foreground">
                  {reportData.status === 'ready' 
                    ? 'Report is ready for download'
                    : reportData.status === 'generating'
                    ? 'Report is being generated...'
                    : reportData.status === 'failed'
                    ? 'Report generation failed'
                    : 'No report generated yet'
                  }
                </div>
              </div>
              
              {reportData.status === 'ready' && (
                <Button 
                  onClick={() => handleDownloadReport(reportData.format)}
                  disabled={downloadReportMutation.isPending}
                  className="bg-gradient-primary shadow-primary"
                >
                  {downloadReportMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download {reportData.format.toUpperCase()}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create a comprehensive OSINT analysis report in your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span className="font-medium">PDF Report</span>
                </div>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Professional PDF document with charts, tables, and detailed analysis. 
                Perfect for presentations and archiving.
              </p>
              <Button 
                onClick={() => handleGenerateReport('pdf')}
                disabled={generateReportMutation.isPending}
                className="w-full"
                variant={downloadFormat === 'pdf' ? 'default' : 'outline'}
              >
                {generateReportMutation.isPending && downloadFormat === 'pdf' ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate PDF'
                )}
              </Button>
            </Card>

            <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">HTML Report</span>
                </div>
                <Badge variant="outline">Interactive</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive HTML document with collapsible sections and live links. 
                Great for web viewing and sharing.
              </p>
              <Button 
                onClick={() => handleGenerateReport('html')}
                disabled={generateReportMutation.isPending}
                className="w-full"
                variant={downloadFormat === 'html' ? 'default' : 'outline'}
              >
                {generateReportMutation.isPending && downloadFormat === 'html' ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate HTML'
                )}
              </Button>
            </Card>
          </div>

          <Separator />

          {/* Report Content Preview */}
          <div>
            <h4 className="font-medium mb-3">Report Contents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Executive Summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Target Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Technical Findings</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>OSINT Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Threat Indicators</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Appendices</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Generation Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Report generation typically takes 2-5 minutes depending on scan complexity</p>
            <p>• PDF reports include high-quality charts and are optimized for printing</p>
            <p>• HTML reports are interactive and include clickable links for further investigation</p>
            <p>• Reports are automatically saved and can be regenerated at any time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};