// src/app/dashboard/_components/NotificationsDropdown.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Button } from '../../components/ui/custom-elements';
import { cn } from '../../lib/utils';
import { AlertData } from '../../types/alerts';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AlertData[];
  onMarkAsRead: (id: number) => void;
  onClearAll: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="fixed inset-0 z-40" aria-hidden={!isOpen}>
      <div
        ref={dropdownRef}
        className={cn(
          "absolute right-4 top-16 w-80 max-h-[80vh] overflow-y-auto p-4 rounded-lg shadow-2xl border border-[#404058] bg-[#2C2C3E] text-[#E0E0F0] transform transition-all duration-300 ease-out",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="flex justify-between items-center mb-4 border-b border-[#404058] pb-2">
          <h3 className="text-xl font-semibold text-[#E0E0F0]">Notificações</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#A0A0C0] hover:text-white">
            <FiX className="h-5 w-5" />
          </Button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-[#A0A0C0] text-center py-4">Nenhuma notificação.</p>
        ) : (
          <div className="space-y-3">
            {unreadNotifications.length > 0 && (
              <>
                <p className="text-sm font-semibold text-[#A0A0C0] uppercase tracking-wider mt-2">Não Lidas</p>
                {unreadNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out",
                      "bg-[#3A3A4E] hover:bg-[#4A4A5E] border border-transparent hover:border-[#8A2BE2]"
                    )}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    {notification.type === 'info' && <FiInfo className="flex-shrink-0 mt-1 text-[#00BFFF]" size={18} />}
                    {notification.type === 'warning' && <FiAlertTriangle className="flex-shrink-0 mt-1 text-[#FFD700]" size={18} />}
                    {notification.type === 'success' && <FiCheckCircle className="flex-shrink-0 mt-1 text-[#32CD32]" size={18} />}
                    {notification.type === 'error' && <FiXCircle className="flex-shrink-0 mt-1 text-[#FF4500]" size={18} />}
                    <div>
                      <p className="text-sm font-medium text-white">{notification.message}</p>
                      <p className="text-xs text-[#A0A0C0] mt-0.5">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {readNotifications.length > 0 && (
              <>
                <p className="text-sm font-semibold text-[#A0A0C0] uppercase tracking-wider mt-4 pt-2 border-t border-[#404058]">Lidas</p>
                {readNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md text-[#A0A0C0] transition-all duration-200 ease-in-out",
                      "bg-[#2C2C3E] hover:bg-[#3A3A4E]"
                    )}
                  >
                    {notification.type === 'info' && <FiInfo className="flex-shrink-0 mt-1 text-[#00BFFF]/60" size={18} />}
                    {notification.type === 'warning' && <FiAlertTriangle className="flex-shrink-0 mt-1 text-[#FFD700]/60" size={18} />}
                    {notification.type === 'success' && <FiCheckCircle className="flex-shrink-0 mt-1 text-[#32CD32]/60" size={18} />}
                    {notification.type === 'error' && <FiXCircle className="flex-shrink-0 mt-1 text-[#FF4500]/60" size={18} />}
                    <div>
                      <p className="text-sm text-[#A0A0C0]">{notification.message}</p>
                      <p className="text-xs text-[#606070] mt-0.5">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-center pt-4 border-t border-[#404058]">
              <Button variant="ghost" onClick={onClearAll} className="text-sm text-[#A0A0C0] hover:text-white">
                Limpar Todas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
