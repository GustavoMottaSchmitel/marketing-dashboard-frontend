// src/app/dashboard/_components/AdvancedFilterModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiTarget, FiImage } from 'react-icons/fi';
import { Button, Input, Label, Select, Card } from '@/app/components/ui/custom-elements';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (startDate: string, endDate: string, campaignId: string, creativeId: string) => void;
  initialStartDate: string;
  initialEndDate: string;
  initialCampaignId: string;
  initialCreativeId: string;
  campaignOptions: { value: string; label: string }[];
  creativeOptions: { value: string; label: string }[];
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialStartDate,
  initialEndDate,
  initialCampaignId,
  initialCreativeId,
  campaignOptions,
  creativeOptions,
}) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedCampaign, setSelectedCampaign] = useState(initialCampaignId);
  const [selectedCreative, setSelectedCreative] = useState(initialCreativeId);

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setSelectedCampaign(initialCampaignId);
    setSelectedCreative(initialCreativeId);
  }, [isOpen, initialStartDate, initialEndDate, initialCampaignId, initialCreativeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(startDate, endDate, selectedCampaign, selectedCreative);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="relative w-full max-w-lg p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
        <h2 className="text-2xl font-bold text-[#E0E0F0] mb-4">Filtros Avançados</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A0A0C0] hover:text-white transition-colors">
          <FiX className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Filtro por Data */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2 text-[#E0E0F0]">
              <FiCalendar className="text-[#8A2BE2]" /> Data Início
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder:text-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2 text-[#E0E0F0]">
              <FiCalendar className="text-[#8A2BE2]" /> Data Final
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder:text-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
          </div>

          {/* Filtro por Campanha */}
          <div className="space-y-2">
            <Label htmlFor="campaignFilter" className="flex items-center gap-2 text-[#E0E0F0]">
              <FiTarget className="text-[#A0A0C0]" /> Campanha
            </Label>
            <Select
              id="campaignFilter"
              options={campaignOptions}
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder:text-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
          </div>

          {/* Filtro por Criativo */}
          <div className="space-y-2">
            <Label htmlFor="creativeFilter" className="flex items-center gap-2 text-[#E0E0F0]">
              <FiImage className="text-[#A0A0C0]" /> Criativo
            </Label>
            <Select
              id="creativeFilter"
              options={creativeOptions}
              value={selectedCreative}
              onChange={(e) => setSelectedCreative(e.target.value)}
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder:text-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Aplicar Filtros
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
