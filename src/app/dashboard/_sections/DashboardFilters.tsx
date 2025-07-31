import React from 'react';
import { Select, Input } from '@/app/components/ui/custom-elements';
import { cn } from '@/app/lib/utils';
import { Clinica } from '@/app/lib/clinicas';

interface DashboardFiltersProps {
    isViewMode: boolean;
    selectedClinicaFilter: string | null;
    handleClinicChange: (value: string) => void;
    clinicas: Clinica[];
    startDate: string;
    handleStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    endDate: string;
    handleEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedCampaign: string;
    handleCampaignChange: (value: string) => void;
    campaignOptions: { value: string; label: string; }[];
    selectedCreative: string;
    handleCreativeChange: (value: string) => void;
    creativeOptions: { value: string; label: string; }[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    isViewMode,
    selectedClinicaFilter,
    handleClinicChange,
    clinicas,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    selectedCampaign,
    handleCampaignChange,
    campaignOptions,
    selectedCreative,
    handleCreativeChange,
    creativeOptions,
}) => {
    return (
        <section className={cn("bg-white p-6 rounded-lg shadow-md border border-gray-200", isViewMode && "hidden")}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                    <label htmlFor="clinic-select" className="block text-sm font-medium text-gray-700 mb-1">Clínica</label>
                    <Select
                        id="clinic-select"
                        value={selectedClinicaFilter || ''}
                        onValueChange={handleClinicChange}
                        options={clinicas.map(c => ({ value: String(c.id), label: c.name }))}
                        placeholder="Selecione uma clínica"
                    />
                </div>
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-3 py-2"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-3 py-2"
                    />
                </div>
                <div>
                    <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 mb-1">Campanha</label>
                    <Select
                        id="campaign-select"
                        value={selectedCampaign}
                        onValueChange={handleCampaignChange}
                        options={campaignOptions}
                        placeholder="Todas as Campanhas"
                    />
                </div>
                <div>
                    <label htmlFor="creative-select" className="block text-sm font-medium text-gray-700 mb-1">Criativo</label>
                    <Select
                        id="creative-select"
                        value={selectedCreative}
                        onValueChange={handleCreativeChange}
                        options={creativeOptions}
                        placeholder="Todos os Criativos"
                    />
                </div>
            </div>
        </section>
    );
};
