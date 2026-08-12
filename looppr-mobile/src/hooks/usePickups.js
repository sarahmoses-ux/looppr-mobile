import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as pickupsApi from '../services/api/pickups.api';
import { useAuth } from '../context/AuthContext';

export function useMyPickups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pickups', user?.email],
    queryFn: pickupsApi.fetchMyPickups,
    enabled: Boolean(user?.email),
  });
}

export function useMyStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pickup-stats', user?.email],
    queryFn: pickupsApi.fetchMyStats,
    enabled: Boolean(user?.email),
  });
}

export function useCreatePickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pickupsApi.createPickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickup-stats'] });
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({ mutationFn: pickupsApi.createPaymentIntent });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pickupsApi.confirmPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickup-stats'] });
    },
  });
}
