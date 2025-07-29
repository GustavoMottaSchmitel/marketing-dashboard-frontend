import { redirect } from 'next/navigation';
import { getServerSession, getCurrentUser } from '@/app/actions/auth';
import { DashboardClientWrapper } from './_components/DashboardClientWrapper'; // Importar o novo componente

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
    <DashboardClientWrapper userEmail={userEmail}>
      {children}
    </DashboardClientWrapper>
  );
}