import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

// Cold app launch always plays the branded splash first, regardless of auth
// state — splash.js itself then routes on to onboarding (signed out) or the
// user's dashboard (signed in) once its intro animation finishes. Direct
// post-auth-action navigation (login, logout, role switch) targets a role's
// home route directly instead of "/", so it doesn't replay this screen.
export default function Index() {
  const { status } = useAuth();

  if (status === 'loading') return null;

  return <Redirect href="/(auth)/splash" />;
}
