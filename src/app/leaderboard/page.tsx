import { redirect } from 'next/navigation';

export default function LeaderboardPage() {
  redirect('/dashboard');
}

export default function LeaderboardPage() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <LeaderboardPageContent />
    </AuthGuard>
  );
}
