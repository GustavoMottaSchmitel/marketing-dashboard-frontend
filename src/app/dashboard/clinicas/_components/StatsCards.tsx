// src/app/dashboard/clinicas/_components/StatsCards.tsx
'use client';

import { FiActivity, FiCheckCircle, FiMap, FiLayers } from 'react-icons/fi';
import { Card } from '../../../components/ui/custom-elements';
import { cn } from '@/app/lib/utils';

interface StatsCardsProps {
  clinicasCount: number;
  activeCount: number;
  statesCount: number;
  specialtiesCount: number;
}

export const StatsCards = ({
  clinicasCount,
  activeCount,
  statesCount,
  specialtiesCount,
}: StatsCardsProps) => {
  const stats = [
    {
      title: 'Total de Clínicas',
      value: clinicasCount,
      icon: <FiActivity className="h-5 w-5" />,
      color: 'text-blue-400',
      bgColorClass: 'bg-blue-400/20'
    },
    {
      title: 'Clínicas Ativas',
      value: activeCount,
      icon: <FiCheckCircle className="h-5 w-5" />,
      color: 'text-green-400',
      bgColorClass: 'bg-green-400/20'
    },
    {
      title: 'Estados Atendidos',
      value: statesCount,
      icon: <FiMap className="h-5 w-5" />,
      color: 'text-purple-400',
      bgColorClass: 'bg-purple-400/20'
    },
    {
      title: 'Especialidades Oferecidas',
      value: specialtiesCount,
      icon: <FiLayers className="h-5 w-5" />,
      color: 'text-orange-400',
      bgColorClass: 'bg-orange-400/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 shadow-xl border border-[#404058] flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#A0A0C0] uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-extrabold mt-2 text-[#E0E0F0]">{stat.value}</h3>
            </div>
            <div className={cn("rounded-full p-3 transition-colors duration-300", stat.bgColorClass, stat.color)}>
              {stat.icon}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1.5 rounded-b-lg" style={{ backgroundColor: stat.bgColorClass.replace('/20', '/50').replace('bg-', '#') }}></div>
        </Card>
      ))}
    </div>
  );
};
