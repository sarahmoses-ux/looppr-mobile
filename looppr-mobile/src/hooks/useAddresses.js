import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as addressesApi from '../services/api/addresses.api';
import { useAuth } from '../context/AuthContext';

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['addresses', user?.email],
    queryFn: addressesApi.listAddresses,
    enabled: Boolean(user?.email),
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.addAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
