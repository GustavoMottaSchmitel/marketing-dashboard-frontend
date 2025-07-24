'use client';

import React from 'react';
import { TableBlock as TableBlockType, CommonBlockRenderProps } from '@/app/types/report-builders';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/custom-elements';
import { cn } from '@/app/lib/utils';

interface TableBlockProps extends CommonBlockRenderProps {
  block: TableBlockType;
}

// Definindo uma interface para a estrutura dos dados da tabela
interface TableRowData {
  id: number;
  name: string;
  leads: number;
  cpl: number;
  specialty: string;
  performanceChange: string; // Mantido como string para o mock, mas pode ser number se for sempre numérico
  alerts: number;
  // Usamos 'unknown' aqui para permitir propriedades adicionais que não estão explicitamente definidas
  // Isso é mais seguro que 'any' e ainda permite flexibilidade.
  [key: string]: unknown;
}

// Dados mockados para demonstração
const mockTableData: TableRowData[] = [
  { id: 1, name: 'Clínica Alpha', leads: 150, cpl: 12.50, specialty: 'Dermatologia', performanceChange: '5.2', alerts: 0 },
  { id: 2, name: 'Clínica Beta', leads: 80, cpl: 18.20, specialty: 'Odontologia', performanceChange: '-2.1', alerts: 1 },
  { id: 3, name: 'Clínica Gama', leads: 200, cpl: 10.00, specialty: 'Oftalmologia', performanceChange: '10.5', alerts: 0 },
  { id: 4, name: 'Clínica Delta', leads: 70, cpl: 22.00, specialty: 'Cardiologia', performanceChange: '-8.0', alerts: 2 },
  { id: 5, name: 'Clínica Epsilon', leads: 180, cpl: 11.00, specialty: 'Pediatria', performanceChange: '3.7', alerts: 0 },
];

export const TableBlock: React.FC<TableBlockProps> = ({ block, isDragging }) => {
  // Faz um cast seguro de block.tableData para TableRowData[]
  // Isso informa ao TypeScript que, se block.tableData existir, ele deve ser tratado como TableRowData[]
  const data: TableRowData[] = (block.tableData && block.tableData.length > 0
    ? (block.tableData as TableRowData[])
    : mockTableData);

  const defaultColumns: TableBlockType['columns'] = [
    { header: 'Nome da Clínica', accessor: 'name' },
    { header: 'Especialidade', accessor: 'specialty' },
    { header: 'Leads Recentes', accessor: 'leads', format: 'number' },
    { header: 'CPL', accessor: 'cpl', format: 'currency' },
    { header: 'Desempenho', accessor: 'performanceChange', format: 'percent' },
    { header: 'Alertas', accessor: 'alerts', format: 'number' },
  ];

  const columns = block.columns && block.columns.length > 0 ? block.columns : defaultColumns;

  // Tipagem do 'value' mais precisa
  const formatCellValue = (value: unknown, formatType?: 'currency' | 'percent' | 'number') => {
    if (value === null || value === undefined) return '-';

    let numValue: number | undefined;

    // Tenta converter para número se for uma string e o formato for numérico
    if (typeof value === 'string' && (formatType === 'currency' || formatType === 'percent' || formatType === 'number')) {
      const parsed = parseFloat(value.replace(',', '.')); // Lida com vírgula como separador decimal
      if (!isNaN(parsed)) {
        numValue = parsed;
      }
    } else if (typeof value === 'number') {
      numValue = value;
    }

    if (numValue !== undefined) {
      switch (formatType) {
        case 'currency': return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
        case 'percent': return `${numValue.toFixed(1)}%`;
        case 'number': return numValue.toLocaleString('pt-BR');
        default: return numValue; // Retorna o número formatado se não houver formato específico
      }
    }

    return String(value); // Retorna o valor original como string se não for um número ou não puder ser formatado
  };

  return (
    <div
      className={cn(
        "p-6 rounded-lg overflow-x-auto",
        block.backgroundColor || 'bg-[#1A1A2A]',
        block.textColor || 'text-[#E0E0F0]',
        block.borderRadius || 'rounded-lg',
        block.boxShadow || 'shadow-md',
        block.layout?.width || 'w-full',
        block.layout?.height || 'h-auto',
        block.layout?.padding || 'p-6',
        block.layout?.marginTop,
        block.layout?.marginBottom,
        block.layout?.alignment === 'center' && 'mx-auto',
        block.layout?.alignment === 'right' && 'ml-auto',
        block.layout?.alignment === 'left' && 'mr-auto',
        isDragging ? 'opacity-50 scale-98' : 'opacity-100 scale-100',
        "transition-all duration-200 ease-in-out"
      )}
      style={{
        backgroundColor: block.backgroundColor,
        color: block.textColor,
      }}
    >
      {block.title && (
        <h3 className={cn(
          "text-xl font-semibold mb-4",
          block.textColor || 'text-white'
        )}>
          {block.title}
        </h3>
      )}
      {data.length > 0 ? (
        <Table className="min-w-full text-sm">
          {block.showHeaders !== false && (
            <TableHeader>
              <TableRow className="bg-[#3A3A4E] hover:bg-[#4A4A5E] transition-colors duration-200">
                {columns.map((col, index) => (
                  <TableHead key={index} className={cn("text-[#A0A0C0] uppercase tracking-wider py-3 px-4 text-left", block.textColor ? `text-[${block.textColor}] opacity-90` : '')}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {data.map((row, rowIndex) => {
              const typedRow: TableRowData = row;
              return (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    "border-b border-[#404058] transition-colors duration-200",
                    block.stripedRows && rowIndex % 2 === 1 ? 'bg-[#2C2C3E]' : 'hover:bg-[#3A3A4E]',
                    block.textColor || 'text-[#E0E0F0]'
                  )}
                >
                  {columns.map((col, colIndex) => {
                    // Acessa o valor da célula de forma segura, pois typedRow é TableRowData
                    const cellValue = typedRow[col.accessor];
                    const isPerformanceChange = col.accessor === 'performanceChange';
                    const isAlerts = col.accessor === 'alerts';

                    const displayValue = formatCellValue(cellValue, col.format);
                    let textColorClass = '';
                    let prefix = '';

                    if (isPerformanceChange) {
                      const numValue = parseFloat(String(cellValue).replace(',', '.'));
                      if (!isNaN(numValue)) {
                        if (numValue >= 0) {
                          textColorClass = 'text-green-400';
                          prefix = '▲ ';
                        } else {
                          textColorClass = 'text-red-400';
                          prefix = '▼ ';
                        }
                      }
                    } else if (isAlerts) {
                      const numValue = parseFloat(String(cellValue));
                      if (!isNaN(numValue) && numValue > 0) {
                        textColorClass = 'text-yellow-400';
                      }
                    }

                    return (
                      <TableCell key={colIndex} className={cn("py-3 px-4", textColorClass, {
                        'font-semibold': isPerformanceChange,
                      })}>
                        {prefix}
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className={cn(
          "text-center py-10",
          block.textColor ? `text-[${block.textColor}] opacity-70` : 'text-[#A0A0C0]'
        )}>
          Nenhum dado de tabela disponível com os filtros selecionados.
        </div>
      )}
    </div>
  );
};
