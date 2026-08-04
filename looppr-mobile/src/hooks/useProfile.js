import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../services/api/users.api';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.email],
    queryFn: () => usersApi.fetchProfile({ email: user.email }),
    enabled: Boolean(user?.email),
  });
}

export function useUpdatePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences) => usersApi.updatePreferences({ email: user.email, preferences }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', user?.email] }),
  });
}
