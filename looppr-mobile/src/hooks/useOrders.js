import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '../services/api/orders.api';
import { useAuth } from '../context/AuthContext';

// Customer-facing order creation/listing/rating now lives in
// usePickups.js against the real PickupRequest model — everything
// below is driver/partner-only, still on the old mock vendor/services shape.

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
