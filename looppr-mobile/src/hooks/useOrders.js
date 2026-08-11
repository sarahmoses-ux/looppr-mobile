import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '../services/api/orders.api';
import { useAuth } from '../context/AuthContext';

export function useVendors() {
  return useQuery({ queryKey: ['vendors'], queryFn: ordersApi.fetchVendors });
}

export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => ordersApi.fetchOrders({ customerEmail: user.email }),
    enabled: Boolean(user?.email),
  });
}

export function useOrder(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.fetchOrder({ orderId }),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useRateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.rateOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDriverRoute() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-route', user?.email],
    queryFn: () => ordersApi.fetchDriverRoute({ driverEmail: user.email }),
    enabled: Boolean(user?.email),
  });
}

export function useDriverEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['driver-earnings', user?.email],
    queryFn: () => ordersApi.fetchDriverEarnings({ driverEmail: user.email }),
    enabled: Boolean(user?.email),
  });
}

export function useLogOrderWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.logOrderWeight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-route'] });
    },
  });
}

export function useLogOrderPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.logOrderPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-route'] });
    },
  });
}

export function usePartnerQueue(vendorId) {
  return useQuery({
    queryKey: ['partner-queue', vendorId],
    queryFn: () => ordersApi.fetchPartnerQueue({ vendorId }),
    enabled: Boolean(vendorId),
  });
}

export function useAdvanceOrderStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.advanceOrderStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-route'] });
      queryClient.invalidateQueries({ queryKey: ['partner-queue'] });
    },
  });
}
