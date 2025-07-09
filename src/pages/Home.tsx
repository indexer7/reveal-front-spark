import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, X, Globe, Mail, Phone, Server } from 'lucide-react';
import { scanApi } from '@/services/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

interface ScanTarget {
  id: string;
  value: string;
  type: 'domain' | 'ip' | 'email' | 'phone';
}

const targetTypes = [
  { value: 'domain', label: 'Domain', icon: Globe },
  { value: 'ip', label: 'IP Address', icon: Server },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
];

export const Home = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [newTarget, setNewTarget] = useState('');
  const [targetType, setTargetType] = useState<'domain' | 'ip' | 'email' | 'phone'>('domain');
  const [isScanning, setIsScanning] = useState(false);

  const addTarget = () => {
    if (!newTarget.trim()) return;

    const target: ScanTarget = {
      id: crypto.randomUUID(),
      value: newTarget.trim(),
      type: targetType,
    };

    setTargets(prev => [...prev, target]);
    setNewTarget('');
  };

  const removeTarget = (id: string) => {
    setTargets(prev => prev.filter(target => target.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTarget();
    }
  };

  const startScan = async () => {
    if (targets.length === 0) {
      toast({
        title: 'No targets',
        description: 'Please add at least one target to scan',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsScanning(true);
      const targetValues = targets.map(t => t.value);
      const response = await scanApi.createScan(targetValues);
      
      toast({
        title: 'Scan started',
        description: `Scanning ${targets.length} target(s)`,
      });

      // Navigate to scan progress page
      navigate(`/scan?jobId=${response.jobId}`);
    } catch (error) {
      toast({
        title: 'Failed to start scan',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getTargetIcon = (type: string) => {
    const targetType = targetTypes.find(t => t.value === type);
    return targetType?.icon || Globe;
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'domain': return 'default';
      case 'ip': return 'secondary';
      case 'email': return 'outline';
      case 'phone': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Target Selection</h1>
          <p className="text-muted-foreground">
            Add targets for OSINT scanning and intelligence gathering
          </p>
        </div>
      </div>

      {/* Add Target Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Target</CardTitle>
          <CardDescription>
            Enter domains, IP addresses, emails, or phone numbers to scan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {targetTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="mr-2 h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Enter ${targetTypes.find(t => t.value === targetType)?.label.toLowerCase()}`}
              className="flex-1"
            />
            
            <Button onClick={addTarget} disabled={!newTarget.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Targets Table */}
      {targets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scan Targets ({targets.length})</CardTitle>
                <CardDescription>
                  Review targets before starting the scan
                </CardDescription>
              </div>
              <Button 
                onClick={startScan} 
                disabled={isScanning}
                className="bg-gradient-primary shadow-primary"
              >
                {isScanning ? 'Starting...' : 'Start Scan'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.map((target) => {
                    const Icon = getTargetIcon(target.type);
                    return (
                      <TableRow key={target.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {target.value}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(target.type) as any}>
                            {targetTypes.find(t => t.value === target.type)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTarget(target.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {targets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No targets added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first target to begin OSINT scanning
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};