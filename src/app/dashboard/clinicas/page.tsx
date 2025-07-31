// src/app/dashboard/clinicas/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiPlus, FiFilter, FiChevronLeft, FiChevronRight, FiBell } from 'react-icons/fi';
import { toast } from 'sonner';
import { estadosBrasil } from '../../lib/constants/states';
import { ClinicaModal } from '../clinicas/_components/ClinicaModal';
import { ClinicaTable } from '../clinicas/_components/ClinicaTable';
import { Filters } from '../clinicas/_components/Filters';
import { StatsCards } from '../clinicas/_components/StatsCards';
import { getClinicas, deleteClinica, saveClinica } from '../../lib/clinicas';
import { getEspecialidades } from '../../lib/especialidades';
import { Clinica, Especialidade } from '../../types/clinicas';
import { AlertData, PaginatedAlertsResponse } from '../../types/alerts';
import { Button, Card } from '../../components/ui/custom-elements';
import { NotificationsDropdown } from '../_components/NotificationsDropdown';
import { getAlerts, markAlertAsRead } from '@/app/lib/alerts';

export default function ClinicasDashboard() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [filteredClinicas, setFilteredClinicas] = useState<Clinica[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    specialty: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClinica, setCurrentClinica] = useState<Clinica | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  const [notifications, setNotifications] = useState<AlertData[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const fetchDataForCurrentPage = useCallback(async () => {
    try {
      setLoading(true);
      const [clinicasResponse, especialidadesData] = await Promise.all([
        getClinicas(currentPage, itemsPerPage, searchTerm, filters.state, filters.specialty, filters.status),
        getEspecialidades()
      ]);

      setClinicas(clinicasResponse.content);
      setEspecialidades(especialidadesData);
      setTotalPages(clinicasResponse.totalPages);
      setTotalElements(clinicasResponse.totalElements);
    } catch (error: unknown) {
      toast.error('Erro ao carregar dados das clínicas.');
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response: PaginatedAlertsResponse = await getAlerts(0, 10);
      setNotifications(response.content);
    } catch (error: unknown) {
      console.error("Erro ao buscar notificações para a página de clínicas:", error);
    }
  }, []);

  useEffect(() => {
    fetchDataForCurrentPage();
    fetchNotifications();
  }, [fetchDataForCurrentPage, fetchNotifications]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filters]);


  const handleMarkAsRead = async (id: number) => {
    try {
      await markAlertAsRead(id);
      toast.success('Alerta marcado como lido.');
      fetchNotifications();
    } catch (error: unknown) {
      toast.error('Erro ao marcar alerta como lido.');
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotificationsDropdown(false);
    toast.info('Todas as notificações foram limpas (apenas localmente).');
  };

  useEffect(() => {
    setFilteredClinicas(clinicas);
  }, [clinicas]);


  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({ state: '', specialty: '', status: '' });
    setSearchTerm('');
  };

  const openEditModal = (clinica: Clinica) => {
    setCurrentClinica(clinica);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading('Excluindo clínica...');
    try {
      await deleteClinica(id);
      await fetchDataForCurrentPage();

      toast.success('Clínica excluída com sucesso!', { id: toastId });
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `Clínica excluída com sucesso! (ID: ${id})`,
          type: 'info',
          date: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    } catch (error: unknown) {
      toast.error('Erro ao excluir clínica', { id: toastId });
      console.error('Erro ao excluir clínica:', error);
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `Falha ao excluir clínica (ID: ${id}).`,
          type: 'error',
          date: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    }
  };

  const handleSaveClinica = async (clinicaData: Clinica) => {
    const toastId = toast.loading('Salvando clínica...');
    try {
      await saveClinica(clinicaData);
      if (!clinicaData.id) {
        setCurrentPage(0);
      }
      await fetchDataForCurrentPage();

      toast.success(clinicaData.id ? 'Clínica atualizada!' : 'Clínica adicionada!', { id: toastId });
      setIsModalOpen(false);
      setNotifications(prev => [
        {
          id: Date.now(),
          message: clinicaData.id ? `Clínica "${clinicaData.name}" atualizada com sucesso!` : `Nova clínica "${clinicaData.name}" adicionada!`,
          type: 'success',
          date: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    } catch (error: unknown) {
      toast.error('Erro ao salvar clínica', { id: toastId });
      console.error('Erro ao salvar clínica:', error);
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `Falha ao salvar clínica "${clinicaData.name}".`,
          type: 'error',
          date: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    }
  };

  const stats = useMemo(() => ({
    activeCount: clinicas.filter(c => c.ativo).length,
    statesCount: [...new Set(clinicas.map(c => c.state))].filter(Boolean).length,
    specialtiesCount: [...new Set(clinicas.flatMap(c => c.especialidades?.map(e => e.id) || []))].length,
    clinicasCount: totalElements
  }), [clinicas, totalElements]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={currentPage === i ? "primary" : "secondary"}
          // Classes ajustadas para o tema branco
          className="mx-1 min-w-[40px] h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out
                     bg-gray-200 hover:bg-gray-300 text-gray-800
                     data-[variant=primary]:bg-indigo-600 data-[variant=primary]:hover:bg-indigo-700 data-[variant=primary]:text-white"
        >
          {i + 1}
        </Button>
      );
    }
    return buttons;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-800">Carregando Clínicas...</p>
          <p className="text-sm text-gray-600">Buscando os dados mais recentes das suas clínicas.</p>
        </div>
      </div>
    );
  }

  if (totalElements === 0 && !searchTerm && filters.state === '' && filters.specialty === '' && filters.status === '') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
        <Card className="p-8 border border-gray-200 rounded-lg shadow-xl text-center max-w-md bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Nenhuma Clínica Cadastrada</h2>
          <p className="mb-6 text-gray-700">Parece que você ainda não adicionou nenhuma clínica. Comece agora!</p>
          <Button
            onClick={() => { setCurrentClinica(null); setIsModalOpen(true); }}
            variant="primary"
            className="flex items-center mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
          >
            <FiPlus className="mr-2" /> Adicionar Primeira Clínica
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen text-gray-900 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-600">Minhas Clínicas</h1>
          <p className="text-gray-700 mt-2 text-lg">
            {totalElements} clínica{totalElements !== 1 ? 's' : ''} cadastrada{totalElements !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">
          <Button
            onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            variant="secondary"
            // Classes ajustadas para o tema branco
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 hover:bg-gray-300 text-yellow-600 transition-all duration-300 ease-in-out relative shadow-md"
          >
            <FiBell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-once">
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            onClick={() => { setCurrentClinica(null); setIsModalOpen(true); }}
            variant="primary"
            // Classes ajustadas para o tema branco
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
          >
            <FiPlus className="mr-2" /> Adicionar Clínica
          </Button>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            // Classes ajustadas para o tema branco
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
          >
            <FiFilter className="mr-2" /> {showFilters ? 'Esconder Filtros' : 'Mais Filtros'}
          </Button>
        </div>
      </div>

      <StatsCards {...stats} />

      {showFilters && (
        <Card className="p-6 mt-4 border border-gray-200 rounded-lg shadow-xl bg-white">
          <Filters
            searchTerm={searchTerm}
            filters={filters}
            especialidades={especialidades}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        </Card>
      )}

      <Card className="p-0 border border-gray-200 rounded-lg shadow-xl bg-white">
        <ClinicaTable
          clinicas={filteredClinicas}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            variant="secondary"
            // Classes ajustadas para o tema branco
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all duration-300 ease-in-out"
          >
            <FiChevronLeft />
          </Button>
          {renderPaginationButtons()}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            variant="secondary"
            // Classes ajustadas para o tema branco
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all duration-300 ease-in-out"
          >
            <FiChevronRight />
          </Button>
        </div>
      )}

      {isModalOpen && (
        <ClinicaModal
          clinica={currentClinica}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClinica}
          estados={estadosBrasil}
          especialidadesDisponiveis={especialidades}
          onEspecialidadeAdded={fetchDataForCurrentPage}
        />
      )}

      <NotificationsDropdown
        isOpen={showNotificationsDropdown}
        onClose={() => setShowNotificationsDropdown(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAllNotifications}
      />
    </div>
  );
}
