import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as businessApi from '../services/api/business.api';
import { useAuth } from '../context/AuthContext';

export function useProperties() {
  return useQuery({ queryKey: ['properties'], queryFn: businessApi.fetchProperties });
}

export function useRequestExtraPickup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyName) => businessApi.requestExtraPickup({ businessEmail: user.email, propertyName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useInvoices() {
  return useQuery({ queryKey: ['invoices'], queryFn: businessApi.fetchInvoices });
}
