import { redirect } from 'next/navigation';
import { getServerSession, getCurrentUser } from '@/app/actions/auth';
import { DashboardLayoutWithProvider } from '@/app/dashboard/_components/DashboardClientWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const user = await getCurrentUser();
  const userEmail = user?.email || null;

  return (
    <DashboardLayoutWithProvider userEmail={userEmail}>
      {children}
    </DashboardLayoutWithProvider>
  );
}
