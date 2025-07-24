// src/app/dashboard/clinicas/_components/ClinicaTable.tsx
'use client';

import { FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Clinica } from '../../../types/clinicas';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '../../../components/ui/custom-elements';
import { getSpecialtyColor } from '@/app/lib/utils';

interface ClinicaTableProps {
  clinicas: Clinica[];
  onEdit: (clinica: Clinica) => void;
  onDelete: (id: number) => void;
}

export const ClinicaTable = ({ clinicas, onEdit, onDelete }: ClinicaTableProps) => {
  if (clinicas.length === 0) {
    return (
      <div className="text-center py-8 text-[#A0A0C0] text-lg">
        <p>Nenhuma clínica encontrada com os filtros aplicados.</p>
        <p className="mt-2 text-sm">Tente ajustar seus critérios de busca ou adicionar uma nova clínica.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#3A3A4E] hover:bg-[#3A3A4E]">
          <TableHead className="text-[#E0E0F0] text-base">Nome</TableHead>
          <TableHead className="text-[#E0E0F0] text-base">Contato</TableHead>
          <TableHead className="text-[#E0E0F0] text-base">Localização</TableHead>
          <TableHead className="text-[#E0E0F0] text-base">Especialidades</TableHead>
          <TableHead className="text-[#E0E0F0] text-base">Status</TableHead>
          <TableHead className="text-right text-[#E0E0F0] text-base">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clinicas.map((clinica) => (
          <TableRow key={clinica.id} className="group hover:bg-[#404058] transition-colors duration-200 ease-in-out">
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-[#6A5ACD] flex items-center justify-center text-[#E0E0F0] font-semibold text-lg shadow-md flex-shrink-0">
                  {clinica.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[#E0E0F0] font-semibold">{clinica.name}</div>
                  <div className="text-sm text-[#A0A0C0]">{clinica.cnpj}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2 text-[#E0E0F0]">
                <FiMail className="text-[#8A2BE2] flex-shrink-0" size={16} />
                <span>{clinica.email}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1 text-[#E0E0F0]">
                <FiPhone className="text-[#8A2BE2] flex-shrink-0" size={16} />
                <span>{clinica.telephone || clinica.cellphone}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2 text-[#E0E0F0]">
                <FiMapPin className="text-[#8A2BE2] flex-shrink-0" size={16} />
                <span>{clinica.city}, {clinica.state}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {clinica.especialidades.map((esp) => (
                  <Badge
                    key={esp.id}
                    color={getSpecialtyColor(esp.nome)}
                    className="text-white hover:opacity-80 transition-opacity duration-200"
                  >
                    {esp.nome}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={clinica.ativo ? 'success' : 'destructive'}
                className={`${
                  clinica.ativo
                    ? 'bg-[#32CD32] text-white hover:bg-[#228B22]'
                    : 'bg-[#FF4500] text-white hover:bg-[#DC143C]'
                }`}
              >
                {clinica.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(clinica)}
                  className="text-[#A0A0C0] hover:text-[#8A2BE2] hover:bg-[#3A3A4E]"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(clinica.id)}
                  className="text-red-500 hover:text-red-400 hover:bg-[#3A3A4E]"
                >
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
