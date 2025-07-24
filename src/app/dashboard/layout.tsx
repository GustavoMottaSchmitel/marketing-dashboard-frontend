// src/app/dashboard/layout.tsx

import { redirect } from 'next/navigation';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { getServerSession, getCurrentUser } from '@/app/actions/auth';

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header userEmail={userEmail} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
