import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as businessApi from '../services/api/business.api';
import { useAuth } from '../context/AuthContext';

export function useBusinessOverview() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['business-overview', user?.email],
    queryFn: businessApi.fetchOverview,
    enabled: Boolean(user?.email),
  });
}

export function useBusinessPickups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['business-pickups', user?.email],
    queryFn: businessApi.fetchPickups,
    enabled: Boolean(user?.email),
  });
}

export function useCreateBusinessPickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessApi.createPickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-pickups'] });
      queryClient.invalidateQueries({ queryKey: ['business-overview'] });
    },
  });
}
