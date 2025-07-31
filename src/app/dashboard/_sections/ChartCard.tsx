// src/app/dashboard/_components/ChartCard.tsx

import React from 'react';
import { Card, Input, Button } from '@/app/components/ui/custom-elements';
import { cn } from '@/app/lib/utils';
import { Maximize } from 'lucide-react';
import { EditableField } from '@/app/types/dashboard';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  isEditMode?: boolean;
  onDataChange: (field: EditableField, value: string) => void;
  dataToEditKeys?: EditableField[];
  isViewMode?: boolean;
  chartType: string;
  chartData: unknown; // Mantido como unknown
  onExpandChart: (type: string, data: unknown, title: string) => void; // Mantido como unknown
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', description, isEditMode, onDataChange, dataToEditKeys, isViewMode, chartType, chartData, onExpandChart }) => (
  <Card className={cn("p-6 flex flex-col rounded-lg shadow-md bg-white border border-gray-200 relative", className)}>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
    <div className="flex-1 min-h-[250px] flex items-center justify-center">
      {children}
    </div>
    {isEditMode && onDataChange && dataToEditKeys && (
      <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Editar Dados (Mocked)</h4>
        {dataToEditKeys.map((editField, idx) => (
          <div key={`${editField.dataIndex}-${String(editField.key)}-${editField.dataType}-${idx}`} className="flex items-center space-x-2 mb-1">
            <label htmlFor={`edit-${String(editField.key)}-${editField.dataIndex}-${editField.dataType}`} className="text-gray-600 text-sm w-28">{editField.label}:</label>
            <Input
              id={`edit-${String(editField.key)}-${editField.dataIndex}-${editField.dataType}`}
              type={editField.type || "number"}
              placeholder="Valor"
              onChange={(e) => onDataChange(editField, e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-2 py-1"
            />
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">
          Os dados serão resetados ao sair do &apos;EDIT MODE&apos;.
        </p>
      </div>
    )}
    {isViewMode && (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onExpandChart(chartType, chartData, title)}
        className="absolute top-3 right-3 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
        aria-label="Expandir Gráfico"
      >
        <Maximize className="h-5 w-5" />
      </Button>
    )}
  </Card>
);
