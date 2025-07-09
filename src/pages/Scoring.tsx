import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Settings, Save, RotateCcw } from 'lucide-react';
import { useScoring } from '@/hooks/useScoring';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Slider,
  Switch,
  Button,
  Badge,
  Separator,
  Spinner,
} from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { ScoringWeights } from '@/lib/types';

export const Scoring = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { scoringData, isLoading, updateWeights, isUpdating } = useScoring(jobId!);
  
  const [localWeights, setLocalWeights] = useState<ScoringWeights>({
    osint: 25,
    technical: 25,
    reputation: 25,
    behavioral: 25,
  });

  const [autoSave, setAutoSave] = useState(false);

  // Update local weights when data loads
  React.useEffect(() => {
    if (scoringData?.weights) {
      setLocalWeights(scoringData.weights);
    }
  }, [scoringData]);

  // Auto-save when weights change if enabled
  React.useEffect(() => {
    if (autoSave && scoringData?.weights) {
      const hasChanged = Object.keys(localWeights).some(
        key => localWeights[key as keyof ScoringWeights] !== scoringData.weights[key as keyof ScoringWeights]
      );
      
      if (hasChanged) {
        const timeoutId = setTimeout(() => {
          updateWeights(localWeights);
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [localWeights, autoSave, scoringData?.weights, updateWeights]);

  const handleWeightChange = (category: keyof ScoringWeights, value: number[]) => {
    setLocalWeights(prev => ({
      ...prev,
      [category]: value[0],
    }));
  };

  const handleSave = () => {
    updateWeights(localWeights);
  };

  const handleReset = () => {
    const defaultWeights = { osint: 25, technical: 25, reputation: 25, behavioral: 25 };
    setLocalWeights(defaultWeights);
    if (autoSave) {
      updateWeights(defaultWeights);
    }
  };

  const getTotalWeight = () => {
    return Object.values(localWeights).reduce((sum, weight) => sum + weight, 0);
  };

  const getOverallScore = () => {
    if (!scoringData?.scores) return 0;
    return Math.round(
      (scoringData.scores.osint * localWeights.osint +
       scoringData.scores.technical * localWeights.technical +
       scoringData.scores.reputation * localWeights.reputation +
       scoringData.scores.behavioral * localWeights.behavioral) / getTotalWeight()
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (!jobId) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
          <h1 className="text-2xl font-bold">Loading scoring data...</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-32 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!scoringData) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No scoring data available</h2>
        <p className="text-muted-foreground">
          Scoring data is not yet available for this scan.
        </p>
      </div>
    );
  }

  const chartData = [
    { category: 'OSINT', score: scoringData.scores.osint, weight: localWeights.osint },
    { category: 'Technical', score: scoringData.scores.technical, weight: localWeights.technical },
    { category: 'Reputation', score: scoringData.scores.reputation, weight: localWeights.reputation },
    { category: 'Behavioral', score: scoringData.scores.behavioral, weight: localWeights.behavioral },
  ];

  const radarData = chartData.map(item => ({
    category: item.category,
    score: item.score,
    weightedScore: (item.score * item.weight) / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Risk Scoring</h1>
            <p className="text-muted-foreground">
              Adjust scoring weights and analyze risk metrics for scan #{jobId.slice(-8)}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="w-32">
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(getOverallScore())}`}>
              {getOverallScore()}
            </div>
            <Badge variant={getScoreBadgeVariant(getOverallScore()) as any} className="text-xs">
              Risk Score
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Scoring Weights
                </CardTitle>
                <CardDescription>
                  Adjust the importance of each scoring category
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-save</span>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OSINT Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">OSINT Intelligence</label>
                <span className="text-sm text-muted-foreground">{localWeights.osint}%</span>
              </div>
              <Slider
                value={[localWeights.osint]}
                onValueChange={(value) => handleWeightChange('osint', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Technical Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Technical Analysis</label>
                <span className="text-sm text-muted-foreground">{localWeights.technical}%</span>
              </div>
              <Slider
                value={[localWeights.technical]}
                onValueChange={(value) => handleWeightChange('technical', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Reputation Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Reputation Scoring</label>
                <span className="text-sm text-muted-foreground">{localWeights.reputation}%</span>
              </div>
              <Slider
                value={[localWeights.reputation]}
                onValueChange={(value) => handleWeightChange('reputation', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Behavioral Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Behavioral Analysis</label>
                <span className="text-sm text-muted-foreground">{localWeights.behavioral}%</span>
              </div>
              <Slider
                value={[localWeights.behavioral]}
                onValueChange={(value) => handleWeightChange('behavioral', value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Total Weight */}
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Weight:</span>
              <span className={getTotalWeight() !== 100 ? 'text-warning' : 'text-success'}>
                {getTotalWeight()}%
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isUpdating || autoSave}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Weights
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Score Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
            <CardDescription>
              Visual representation of risk scores by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'score' ? '' : '%'}`,
                    name === 'score' ? 'Score' : 'Weight'
                  ]}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Assessment Radar</CardTitle>
            <CardDescription>
              Comprehensive view of weighted risk scores across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Raw Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Weighted Score"
                  dataKey="weightedScore"
                  stroke="hsl(var(--accent-foreground))"
                  fill="hsl(var(--accent-foreground))"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};