import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '@/services/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Spinner,
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import type { UploadFile } from '@/lib/types';

interface UploadProgress {
  [fileId: string]: number;
}

export const Upload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const queryClient = useQueryClient();

  const { data: uploadedFiles, isLoading } = useQuery({
    queryKey: ['uploadedFiles'],
    queryFn: () => uploadApi.getUploadedFiles(),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, fileId }: { file: File; fileId: string }) =>
      uploadApi.uploadFile(file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }),
    onSuccess: (uploadedFile, { fileId }) => {
      // Remove progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['uploadedFiles'] });
      
      toast({
        title: 'File uploaded',
        description: `${uploadedFile.filename} has been uploaded successfully`,
      });
    },
    onError: (error: Error, { fileId }) => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: uploadApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadedFiles'] });
      toast({
        title: 'File deleted',
        description: 'File has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileId = crypto.randomUUID();
      uploadMutation.mutate({ file, fileId });
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/zip': ['.zip'],
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('json')) return '📋';
    if (type.includes('csv')) return '📊';
    if (type.includes('zip')) return '📦';
    return '📄';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'uploading':
        return <Spinner size="sm" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'default';
      case 'uploading':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <UploadIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">File Upload</h1>
          <p className="text-muted-foreground">
            Upload target lists, configuration files, and other resources for analysis
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supports TXT, CSV, JSON, PDF, images, and ZIP files up to 100MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }
            `}
          >
            <input {...getInputProps()} />
            <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: TXT, CSV, JSON, XML, PDF, Images, ZIP
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploading Files</h4>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            Manage your uploaded files and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                  <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : uploadedFiles?.data.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files uploaded</h3>
              <p className="text-muted-foreground">
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedFiles?.data.map((file: UploadFile) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div>
                            <div className="font-medium">{file.filename}</div>
                            <div className="text-sm text-muted-foreground">{file.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(file.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(file.status)}
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(file.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Supported File Types</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Target lists (TXT, CSV)</li>
                <li>• Configuration files (JSON, XML)</li>
                <li>• Documentation (PDF)</li>
                <li>• Screenshots and evidence (PNG, JPG)</li>
                <li>• Archive files (ZIP)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Limits</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Maximum file size: 100MB</li>
                <li>• Multiple files supported</li>
                <li>• Files are scanned for security</li>
                <li>• Automatic virus detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};