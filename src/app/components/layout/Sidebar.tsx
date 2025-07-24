// src/app/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Video,
  BarChart4,
  Settings,
  MessageSquare,
  UserCog,
  LogOut,
  Bell,
  LayoutList
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { logoutAction } from '@/app/actions/auth';
import { cn } from '@/app/lib/utils';

interface NextRedirectError extends Error {
  digest?: string;
}

const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutAction();
      toast.success('Sessão encerrada com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
        throw error;
      }
      console.error('Erro ao fazer logout no Sidebar:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao encerrar sessão.');
      } else {
        toast.error('Erro desconhecido ao encerrar sessão.');
      }
    }
  };

  const menuItems = [
    {
      title: 'VISÃO GERAL',
      items: [
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          href: '/dashboard',
          description: 'Visualização das principais métricas e desempenho'
        },
        {
          name: 'Alertas',
          icon: Bell,
          href: '/dashboard/alerts',
          description: 'Notificações e insights importantes'
        },
      ],
    },
    {
      title: 'GESTÃO',
      items: [
        {
          name: 'Clínicas',
          icon: Building2,
          href: '/dashboard/clinicas',
          description: 'Cadastro e gestão das clínicas parceiras'
        },
        {
          name: 'Campanhas',
          icon: Megaphone,
          href: '/dashboard/campanhas',
          description: 'Gestão de campanhas publicitárias e métricas'
        },
        {
          name: 'Vídeos',
          icon: Video,
          href: '/dashboard/videos',
          description: 'Upload e análise de vídeos publicitários'
        },
      ],
    },
    {
      title: 'RELATÓRIOS',
      items: [
        {
          name: 'Métricas',
          icon: BarChart4,
          href: '/dashboard/metricas',
          description: 'Relatórios detalhados de performance'
        },
        {
          name: 'Construtor de Relatórios',
          icon: LayoutList,
          href: '/dashboard/report-builder',
          description: 'Crie e personalize seus próprios relatórios'
        },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        {
          name: 'Configurações',
          icon: Settings,
          href: '/dashboard/configuracoes',
          description: 'Preferências do sistema e usuários'
        },
        {
          name: 'Mensagens',
          icon: MessageSquare,
          href: '/dashboard/mensagens',
          description: 'Central de comunicação'
        },
        {
          name: 'Usuários',
          icon: UserCog,
          href: '/dashboard/usuarios',
          description: 'Gestão de acessos e perfis'
        },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#2C2C3E] border-r border-[#404058] flex flex-col shadow-2xl z-40">
      {/* Logo e Branding */}
      <div className="flex flex-col items-center justify-center h-20 border-b border-[#404058] px-4 py-3 bg-[#2C2C3E] relative overflow-hidden">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#8A2BE2] to-[#6A5ACD] bg-clip-text text-transparent drop-shadow-lg animate-fade-in-down">
          MyBimed
        </span>
        <span className="text-xs font-semibold text-[#A0A0C0] mt-1 tracking-widest opacity-80 animate-fade-in-up">
          COMPACTSYNC
        </span>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2A] to-transparent opacity-30"></div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="px-6 mb-3 text-xs font-bold text-[#A0A0C0] uppercase tracking-wider">
              {section.title}
            </h3>
            <ul>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link
                    href={item.href}
                    className={cn(
                      `flex items-center px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden`,
                      pathname === item.href
                        ? 'text-white bg-[#404058] rounded-lg mx-3 shadow-inner'
                        : 'text-[#E0E0F0] hover:bg-[#3A3A4E] rounded-lg mx-3 hover:shadow-sm'
                    )}
                  >
                    {pathname === item.href && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-[#8A2BE2] rounded-l-lg animate-slide-in-left"></span>
                    )}
                    <item.icon className={cn("w-5 h-5 mr-3 transition-colors duration-300", pathname === item.href ? "text-[#8A2BE2]" : "text-[#A0A0C0] group-hover:text-white")} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer da Sidebar (Sair e Copyright) */}
      <div className="p-4 border-t border-[#404058] text-center bg-[#2C2C3E]">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-3 rounded-lg w-full text-left transition-all duration-300 ease-in-out
            text-[#FF4500] hover:bg-[#404058] hover:text-white mb-4 font-semibold shadow-md hover:shadow-lg"
        >
          <LogOut size={20} className="mr-3" />
          <span className="">Sair</span>
        </button>
        <p className="text-xs text-[#A0A0C0] opacity-70">
          © {new Date().getFullYear()} MyBimed
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
