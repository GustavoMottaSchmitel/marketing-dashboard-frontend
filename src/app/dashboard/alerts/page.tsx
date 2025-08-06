// src/app/dashboard/alerts/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '@/app/components/ui/custom-elements';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';
import { getAlerts, markAlertAsRead } from '@/app/lib/alerts';
import { AlertData, PaginatedAlertsResponse } from '@/app/types/alerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlerts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedAlertsResponse = await getAlerts(page, 10, searchTerm);
      setAlerts(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (err: unknown) {
      console.error("Erro ao buscar alertas:", err);
      setError((err as Error).message || "Falha ao carregar alertas.");
      toast.error('Erro ao carregar alertas.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAlerts(currentPage);
  }, [fetchAlerts, currentPage]);

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, read: true } : alert));
      toast.success('Alerta marcado como lido!');
    } catch (err) {
      console.error("Erro ao marcar alerta como lido:", err);
      toast.error('Falha ao marcar alerta como lido.');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchAlerts(0);
  };

  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alertas e Notificações</h1>
        <Button onClick={() => fetchAlerts(currentPage)} variant="secondary" className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md shadow-sm transition-colors">
          <FiRefreshCw className="mr-2" /> Atualizar Alertas
        </Button>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Alertas</CardTitle>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="pl-10 pr-4 py-2 bg-white border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
            <FiSearch className="absolute left-3 text-gray-400" /> {/* Linha corrigida */}
            <Button onClick={handleSearch} className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-gray-600">Carregando alertas...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">Erro: {error}</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Nenhum alerta encontrado.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-gray-600">Tipo</TableHead>
                      <TableHead className="text-gray-600">Mensagem</TableHead>
                      <TableHead className="text-gray-600">Data</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id} className={alert.read ? 'text-gray-600 bg-gray-50 hover:bg-gray-100' : 'font-semibold text-gray-900 bg-white hover:bg-gray-100'}>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>{format(new Date(alert.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                        <TableCell>{alert.read ? 'Lido' : 'Não Lido'}</TableCell>
                        <TableCell>
                          {!alert.read && (
                            <Button onClick={() => handleMarkAsRead(alert.id)} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                              Marcar como Lido
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  variant="ghost"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <FiChevronLeft />
                </Button>
                {pageNumbers.map(page => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    className={currentPage === page ? 'bg-indigo-600 text-white rounded-full px-4 py-2 shadow-sm' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full px-4 py-2'}
                  >
                    {page + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  variant="ghost"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <FiChevronRight />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
