import { Redirect } from 'expo-router';
import { isAuthed } from '@/lib/session';

export default function Index() {
  if (isAuthed()) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
