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
      <div className="text-center py-8 text-gray-500 text-lg bg-white rounded-lg shadow-md border border-gray-200">
        <p>Nenhuma clínica encontrada com os filtros aplicados.</p>
        <p className="mt-2 text-sm">Tente ajustar seus critérios de busca ou adicionar uma nova clínica.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <Table className="min-w-full divide-y divide-gray-200 bg-white">
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nome</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Contato</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Localização</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Especialidades</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-100">
          {clinicas.map((clinica) => (
            <TableRow key={clinica.id} className="group hover:bg-gray-50 transition-colors duration-200 ease-in-out">
              <TableCell className="px-6 py-4 whitespace-nowrap font-medium">
                <div className="flex items-center space-x-3">
                  {clinica.logoUrl ? (
                    <img src={clinica.logoUrl} alt={`${clinica.name} Logo`} className="h-10 w-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold text-lg shadow-sm flex-shrink-0">
                      {clinica.name ? clinica.name.charAt(0).toUpperCase() : 'N/A'}
                    </div>
                  )}
                  <div>
                    <div className="text-gray-900 font-semibold">{clinica.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{clinica.cnpj || 'CNPJ não informado'}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiMail className="text-indigo-600 flex-shrink-0" size={16} />
                  <span>{clinica.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-gray-700">
                  <FiPhone className="text-indigo-600 flex-shrink-0" size={16} />
                  <span>{clinica.telephone || clinica.cellphone || 'Telefone não informado'}</span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiMapPin className="text-indigo-600 flex-shrink-0" size={16} />
                  <span>{clinica.city || 'Cidade não informada'}, {clinica.state || 'Estado não informado'}</span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {clinica.especialidades && clinica.especialidades.length > 0 ? (
                    clinica.especialidades.map((esp) => (
                      <Badge
                        key={esp.id}
                        style={{ backgroundColor: esp.color || getSpecialtyColor(esp.nome), color: '#FFFFFF' }}
                        className="text-white hover:opacity-80 transition-opacity duration-200"
                      >
                        {esp.nome}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm italic">Nenhuma especialidade</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant={clinica.ativo ? 'success' : 'destructive'}
                  className={`${
                    clinica.ativo
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {clinica.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(clinica)}
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-gray-100 p-1 rounded-full transition-colors"
                    aria-label={`Editar ${clinica.name}`}
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(clinica.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-gray-100 p-1 rounded-full transition-colors"
                    aria-label={`Excluir ${clinica.name}`}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
