import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { cn } from '@/app/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | MyBimed Dashboard',
    default: 'MyBimed Dashboard'
  },
  description: 'Sistema de gestão de clínicas médicas',
  keywords: ['gestão médica', 'clínicas', 'dashboard', 'mybimed'],
  authors: [{ name: 'MyBimed', url: 'http://mybimed.com.br' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, "min-h-screen bg-gray-100 text-gray-900")}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
