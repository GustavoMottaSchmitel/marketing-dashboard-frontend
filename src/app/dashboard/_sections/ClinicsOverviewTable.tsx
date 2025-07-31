// src/app/dashboard/_sections/ClinicsOverviewTable.tsx

import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card, Input } from '@/app/components/ui/custom-elements';
import { EditableField } from '@/app/types/dashboard';
import { ClinicOverviewData as BackendClinicOverviewData } from '@/app/lib/dashboard';

interface ClinicsOverviewTableProps {
    clinicsOverviewForTable: BackendClinicOverviewData[];
    isEditMode: boolean;
    handleEditableDataChange: (field: EditableField, value: string) => void;
}

export const ClinicsOverviewTable: React.FC<ClinicsOverviewTableProps> = ({
    clinicsOverviewForTable,
    isEditMode,
    handleEditableDataChange,
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Tabelas e Detalhes</h2>
            <Card className="p-6 rounded-lg shadow-md bg-white border border-gray-200">
                {clinicsOverviewForTable.length > 0 ? (
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-100 hover:bg-gray-200">
                                <TableHead className="text-gray-600">Nome da Clínica</TableHead>
                                <TableHead className="text-gray-600">Especialidades</TableHead>
                                <TableHead className="text-gray-600">Campanhas Ativas</TableHead>
                                <TableHead className="text-gray-600">Leads Recentes</TableHead>
                                <TableHead className="text-gray-600">Desempenho (vs Mês Ant.)</TableHead>
                                <TableHead className="text-gray-600">Alertas</TableHead>
                                <TableHead className="text-gray-600">CPL</TableHead>
                                <TableHead className="text-gray-600">CPC</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicsOverviewForTable.map((clinic: BackendClinicOverviewData, index: number) => (
                                <TableRow key={index} className="hover:bg-gray-50 border-gray-200 text-gray-800">
                                    <TableCell className="font-medium">
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={clinic.name}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'name', label: 'Nome da Clínica' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.name}
                                    </TableCell>
                                    <TableCell>
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={clinic.specialties}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'specialties', label: 'Especialidades' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.specialties}
                                    </TableCell>
                                    <TableCell>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.activeCampaigns.toString()}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'activeCampaigns', label: 'Campanhas Ativas' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.activeCampaigns}
                                    </TableCell>
                                    <TableCell>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.recentLeads.toString()}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'recentLeads', label: 'Leads Recentes' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.recentLeads}
                                    </TableCell>
                                    <TableCell className={`font-semibold ${parseFloat(clinic.performanceChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.performanceChange}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'performanceChange', label: 'Desempenho' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : (
                                            <>
                                                {parseFloat(clinic.performanceChange) >= 0 ? '▲' : '▼'} {clinic.performanceChange}%
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-red-500">
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.alerts?.toString() || ''}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'alerts', label: 'Alertas' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.alerts?.toString() || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.cpl.toString()}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'cpl', label: 'CPL' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.cpl.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={clinic.cpc.toString()}
                                                onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'cpc', label: 'CPC' }, e.target.value)}
                                                className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                                            />
                                        ) : clinic.cpc.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-gray-500 py-10">Nenhum dado de clínica disponível com os filtros selecionados.</div>
                )}
            </Card>
        </div>
    );
};
