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
  LayoutList,
  MenuIcon
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

interface SidebarProps {
  isMinimized: boolean;
  isViewMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMinimized, isViewMode }) => {
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

  if (isViewMode) {
    return null;
  }

  return (
    <aside className={cn(
      // Removido 'fixed', 'left-0', 'top-0', 'h-full'
      "flex flex-col bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out",
      isMinimized ? "w-16" : "w-60"
    )}>
      {/* Logo e Branding */}
      <div className={cn(
        "flex items-center justify-center h-20 border-b border-gray-200",
        isMinimized ? "px-2" : "px-6"
      )}>
        {isMinimized ? (
          <MenuIcon className="h-8 w-8 text-indigo-600" />
        ) : (
          <h2 className="text-2xl font-bold text-gray-900">MyBimed</h2>
        )}
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-4">
            {!isMinimized && (
              <h3 className="px-6 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link
                    href={item.href}
                    className={cn(
                      `flex items-center py-2 px-4 text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden`,
                      isMinimized ? "justify-center" : "mx-3 rounded-lg",
                      pathname === item.href
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                    )}
                  >
                    {pathname === item.href && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-l-lg animate-slide-in-left"></span>
                    )}
                    <item.icon className={cn("w-5 h-5", isMinimized ? "" : "mr-3", pathname === item.href ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600")} />
                    {!isMinimized && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer da Sidebar (Sair e Copyright) */}
      <div className={cn(
        "p-4 border-t border-gray-200 text-center bg-white",
        isMinimized ? "px-2" : "px-4"
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center p-3 rounded-lg w-full text-left transition-all duration-300 ease-in-out",
            "text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold shadow-sm hover:shadow-md",
            isMinimized ? "justify-center" : ""
          )}
        >
          <LogOut size={20} className={cn("", isMinimized ? "" : "mr-3")} />
          {!isMinimized && <span className="">Sair</span>}
        </button>
        {!isMinimized && (
          <p className="text-xs text-gray-500 opacity-70 mt-2">
            © {new Date().getFullYear()} MyBimed
          </p>
        )}
      </div>
    </aside>
  );
};

export { Sidebar };
