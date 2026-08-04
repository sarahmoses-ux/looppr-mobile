import { useQuery } from '@tanstack/react-query';
import * as partnerApi from '../services/api/partner.api';
import { usePartnerQueue as useOrdersPartnerQueue } from './useOrders';
import { useAuth } from '../context/AuthContext';

export function usePartnerQueue() {
  const { user } = useAuth();
  return useOrdersPartnerQueue(user?.vendorId);
}

export function useFacilityCapacity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['facility-capacity', user?.vendorId],
    queryFn: () => partnerApi.fetchFacilityCapacity({ vendorId: user.vendorId }),
    enabled: Boolean(user?.vendorId),
  });
}

export function usePartnerPayouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['partner-payouts', user?.vendorId],
    queryFn: () => partnerApi.fetchPartnerPayouts({ vendorId: user.vendorId }),
    enabled: Boolean(user?.vendorId),
  });
}
