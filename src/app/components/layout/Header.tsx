// src/app/components/layout/Header.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, CalendarDays, Download, Bell, Settings, ChevronDown, ChevronUp, FileText, DownloadCloud, Printer, User, LogOut } from "lucide-react";
import { logoutAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NotificationsDropdown } from '@/app/dashboard/_components/NotificationsDropdown';
import { getAlerts, markAlertAsRead } from '@/app/lib/alerts';
import { AlertData, PaginatedAlertsResponse } from '@/app/types/alerts';
import Link from 'next/link';
import { Card } from "../ui/custom-elements";

interface HeaderProps {
  userEmail: string | null;
}

interface NextRedirectError extends Error {
  digest?: string;
}

const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

const Header: React.FC<HeaderProps> = ({ userEmail }) => {
  const router = useRouter();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [notifications, setNotifications] = useState<AlertData[]>([]);

  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response: PaginatedAlertsResponse = await getAlerts(0, 5);
      setNotifications(response.content);
    } catch (error: unknown) {
      console.error("Erro ao buscar notificações:", error);
      toast.error('Erro ao carregar notificações.');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotifications]);

  const handleMarkNotificationAsRead = async (alertId: number) => {
    try {
      await markAlertAsRead(alertId);
      toast.success('Alerta marcado como lido!');
      setNotifications(prev => prev.map(n => n.id === alertId ? { ...n, read: true } : n));
    } catch (error: unknown) {
      toast.error('Erro ao marcar alerta como lido.');
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotificationsDropdown(false);
    toast.info('Todas as notificações foram limpas (apenas localmente).');
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      toast.success('Sessão encerrada com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
        throw error;
      }
      console.error('Erro ao fazer logout:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao encerrar sessão.');
      } else {
        toast.error('Erro desconhecido ao encerrar sessão.');
      }
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationsDropdown(prev => !prev);
    if (!showNotificationsDropdown) {
      fetchNotifications();
    }
  };

  const handleExportPdfClick = () => {
    setShowExportDropdown(false);
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#2C2C3E] border-b border-[#404058] shadow-xl relative z-30">
      <div className="flex items-center justify-between px-6 py-4 w-full h-20">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mr-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0C0]" />
          <input
            type="text"
            placeholder="Buscar clínica, campanha..."
            className="w-full pl-11 pr-4 py-1.5 h-9 rounded-xl border border-[#404058] bg-[#1C1C2C] text-sm text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-2 focus:ring-[#8A2BE2] focus:outline-none transition"
          />
        </div>

        {/* Right-aligned Action Buttons and User Profile */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8A2BE2] hover:bg-[#6A5ACD] text-white text-sm font-medium transition shadow-md"
            >
              <Download size={18} />
              Exportar {showExportDropdown ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
            {showExportDropdown && (
              <Card className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#2C2C3E] border border-[#404058] rounded-md shadow-lg z-40 p-1">
                <Link
                  href="/dashboard/report-builder"
                  onClick={handleExportPdfClick}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#E0E0F0] hover:bg-[#404058] rounded-md transition-colors"
                >
                  <FileText size={16} /> Exportar para PDF
                </Link>
                <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#E0E0F0] hover:bg-[#404058] rounded-md transition-colors">
                  <DownloadCloud size={16} /> Exportar para Excel
                </button>
                <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#E0E0F0] hover:bg-[#404058] rounded-md transition-colors">
                  <Printer size={16} /> Imprimir
                </button>
              </Card>
            )}
          </div>

          {/* Calendar Button */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#404058] text-sm text-[#E0E0F0] hover:bg-[#404058] transition shadow-md">
            <CalendarDays size={18} />
            Últimos 7 dias
          </button>

          {/* Notifications Bell Button and Dropdown */}
          <div className="relative" ref={notificationsDropdownRef}>
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-yellow-400 hover:bg-[#404058] rounded-full transition shadow-md"
              aria-label="Notificações e Alertas"
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4500] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-once">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {showNotificationsDropdown && (
              <NotificationsDropdown
                isOpen={showNotificationsDropdown}
                onClose={() => setShowNotificationsDropdown(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onClearAll={handleClearAllNotifications}
              />
            )}
          </div>

          {/* Settings Button */}
          <button className="p-2 text-[#A0A0C0] hover:bg-[#404058] rounded-full transition shadow-md">
            <Settings size={20} />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#404058] transition cursor-pointer shadow-md"
              aria-label="Perfil do usuário e sair"
            >
              <span className="text-sm font-medium text-[#E0E0F0] hidden sm:block">
                {userEmail || 'Carregando...'}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#6A5ACD] flex items-center justify-center text-[#E0E0F0] font-semibold text-sm shadow-md">
                {userInitial}
              </div>
              {showUserDropdown ? <ChevronUp size={16} className="ml-1 text-[#A0A0C0]" /> : <ChevronDown size={16} className="ml-1 text-[#A0A0C0]" />}
            </button>
            {showUserDropdown && (
              <Card className="absolute right-0 mt-2 w-48 bg-[#2C2C3E] border border-[#404058] rounded-md shadow-lg z-40 p-1">
                <button
                  onClick={() => { router.push('/dashboard/configuracoes-conta'); setShowUserDropdown(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#E0E0F0] hover:bg-[#404058] rounded-md transition-colors"
                >
                  <User size={16} /> Configurações da Conta
                </button>
                <div className="border-t border-[#404058] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#FF4500] hover:bg-[#404058] rounded-md transition-colors"
                >
                  <LogOut size={16} /> Sair
                </button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
