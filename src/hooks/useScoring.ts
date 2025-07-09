import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringApi } from '@/services/api';
import type { ScoringData, ScoringWeights } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export const useScoring = (jobId: string) => {
  const queryClient = useQueryClient();

  const {
    data: scoringData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['scoring', jobId],
    queryFn: () => scoringApi.getScoring(jobId),
    enabled: !!jobId,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    staleTime: 2000, // Consider data stale after 2 seconds
  });

  const updateWeightsMutation = useMutation({
    mutationFn: (weights: ScoringWeights) => 
      scoringApi.updateWeights(jobId, weights),
    onSuccess: (data) => {
      // Update the query cache with the new data
      queryClient.setQueryData(['scoring', jobId], data);
      
      toast({
        title: 'Weights updated',
        description: 'Scoring weights have been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateWeights = (weights: ScoringWeights) => {
    updateWeightsMutation.mutate(weights);
  };

  return {
    scoringData,
    isLoading,
    error,
    refetch,
    updateWeights,
    isUpdating: updateWeightsMutation.isPending,
  };
};