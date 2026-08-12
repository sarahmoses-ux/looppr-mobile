import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as driverApi from '../services/api/driver.api';
import { useAuth } from '../context/AuthContext';

export function useDriverOverview() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-overview', user?.email],
    queryFn: driverApi.fetchOverview,
    enabled: Boolean(user?.email),
  });
}

export function useDriverEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-earnings', user?.email],
    queryFn: driverApi.fetchEarnings,
    enabled: Boolean(user?.email),
  });
}

export function useIncomingDeliveries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-incoming', user?.email],
    queryFn: driverApi.fetchIncomingDeliveries,
    enabled: Boolean(user?.email),
    refetchInterval: 15000,
  });
}

export function useMyDeliveries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-mine', user?.email],
    queryFn: driverApi.fetchMyDeliveries,
    enabled: Boolean(user?.email),
  });
}

function invalidateDriverQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['driver-incoming'] });
  queryClient.invalidateQueries({ queryKey: ['driver-mine'] });
  queryClient.invalidateQueries({ queryKey: ['driver-overview'] });
  queryClient.invalidateQueries({ queryKey: ['driver-earnings'] });
}

export function useAcceptDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverApi.acceptDelivery,
    onSuccess: () => invalidateDriverQueries(queryClient),
  });
}

export function useRejectDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverApi.rejectDelivery,
    onSuccess: () => invalidateDriverQueries(queryClient),
  });
}

export function useUpdateDeliveryStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverApi.updateDeliveryStage,
    onSuccess: () => invalidateDriverQueries(queryClient),
  });
}

export function useConfirmDeliveryWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverApi.confirmWeight,
    onSuccess: () => invalidateDriverQueries(queryClient),
  });
}

export function useUpdateDriverAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverApi.updateAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver-overview'] }),
  });
}
