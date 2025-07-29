import { redirect } from 'next/navigation';
import { getServerSession, getCurrentUser } from '@/app/actions/auth';
import { DashboardClientWrapper } from './_components/DashboardClientWrapper';

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

  const initialIsEditMode = false; // Define um estado inicial para o modo de edição

  return (
    <DashboardClientWrapper userEmail={userEmail} isEditModeFromParent={initialIsEditMode}>
      {children}
    </DashboardClientWrapper>
  );
}