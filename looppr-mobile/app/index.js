import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { ROLE_GROUP } from '../src/constants/roles';

export default function Index() {
  const { status, currentRole } = useAuth();

  if (status === 'loading') return null;
  if (status !== 'signedIn' || !currentRole) return <Redirect href="/(auth)/splash" />;

  return <Redirect href={`/(${ROLE_GROUP[currentRole]})`} />;
}
