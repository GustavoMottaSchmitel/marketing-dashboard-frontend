import React from 'react';
import { Card } from '@/app/components/ui/custom-elements';
import { cn } from '@/app/lib/utils';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi'; 
import { AlertData } from '@/app/lib/dashboard';

interface RecentAlertsSectionProps {
  recentAlerts: AlertData[];
}

export const RecentAlertsSection: React.FC<RecentAlertsSectionProps> = ({ recentAlerts }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Alertas Recentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentAlerts.length > 0 ? (
          recentAlerts.map(alert => (
            <Card key={alert.id} className={cn(`p-5 flex items-start gap-4 rounded-lg shadow-md`, {
              'border-yellow-300 bg-yellow-50': alert.type === 'warning',
              'border-blue-300 bg-blue-50': alert.type === 'info',
              'border-green-300 bg-green-50': alert.type === 'success',
              'border-red-300 bg-red-50': alert.type === 'error',
            }, 'text-gray-900')}>
              <div className="flex-shrink-0 mt-1">
                {alert.type === 'warning' && <FiAlertTriangle size={20} className="text-yellow-600" />}
                {alert.type === 'info' && <FiInfo size={20} className="text-blue-600" />}
                {alert.type === 'success' && <FiCheckCircle size={20} className="text-green-600" />}
                {alert.type === 'error' && <FiXCircle size={20} className="text-red-600" />}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-800">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">Data: {new Date(alert.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10 col-span-full">
            <p className="text-lg">Nenhum alerta recente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
