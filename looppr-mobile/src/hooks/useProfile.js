import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../services/api/auth.api';
import { useAuth } from '../context/AuthContext';

// Real profile identity (name/email/phone/emailNotifications/createdAt)
// lives on GET/PATCH /auth/me — there is no separate "users" domain on
// looppr-backend. Preferences (fold/detergent/temp) and a referral code
// aren't persisted anywhere server-side; those live only on a booking
// itself (see bookingOptions.js) and aren't part of a saved profile.
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.email],
    queryFn: () => authApi.fetchMe({ email: user.email }),
    enabled: Boolean(user?.email),
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch) => authApi.updateMe({ email: user.email, ...patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', user?.email] }),
  });
}
