import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as partnerApi from '../services/api/partner.api';
import { useAuth } from '../context/AuthContext';

export function usePartnerOverview() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['partner-overview', user?.email],
    queryFn: partnerApi.fetchOverview,
    enabled: Boolean(user?.email),
  });
}

export function usePartnerEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['partner-earnings', user?.email],
    queryFn: partnerApi.fetchEarnings,
    enabled: Boolean(user?.email),
  });
}

export function useIncomingOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['partner-incoming', user?.email],
    queryFn: partnerApi.fetchIncomingOrders,
    enabled: Boolean(user?.email),
    refetchInterval: 15000,
  });
}

export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['partner-mine', user?.email],
    queryFn: partnerApi.fetchMyOrders,
    enabled: Boolean(user?.email),
  });
}

function invalidatePartnerQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['partner-incoming'] });
  queryClient.invalidateQueries({ queryKey: ['partner-mine'] });
  queryClient.invalidateQueries({ queryKey: ['partner-overview'] });
  queryClient.invalidateQueries({ queryKey: ['partner-earnings'] });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partnerApi.acceptOrder,
    onSuccess: () => invalidatePartnerQueries(queryClient),
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partnerApi.rejectOrder,
    onSuccess: () => invalidatePartnerQueries(queryClient),
  });
}

export function useUpdatePartnerOrderStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partnerApi.updateOrderStage,
    onSuccess: () => invalidatePartnerQueries(queryClient),
  });
}

export function useUpdatePartnerAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partnerApi.updateAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner-overview'] }),
  });
}
