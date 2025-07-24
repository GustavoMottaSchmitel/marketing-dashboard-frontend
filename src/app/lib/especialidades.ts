import { get, post } from './api';

import { Especialidade } from '../types/clinicas'; 
import { getSpecialtyColor } from './utils'; 

/**
 * Busca todas as especialidades do backend.
 * @returns Promise<Especialidade[]> Uma promessa que resolve para uma lista de especialidades.
 */
export const getEspecialidades = async (): Promise<Especialidade[]> => {
  const path = '/especialidades';

  try {
    const data = await get(path);
    return data as Especialidade[];
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    throw error;
  }
};

/**
 * Salva uma nova especialidade no backend.
 * Se a especialidade não tiver uma cor definida, uma cor será gerada.
 * @param especialidadeData Dados da especialidade a ser salva (nome e opcionalmente cor).
 * @returns Promise<Especialidade> A especialidade salva com o ID e a cor (se gerada).
 */
export const saveEspecialidade = async (especialidadeData: Omit<Especialidade, 'id'>): Promise<Especialidade> => {
  const colorToSave = especialidadeData.color || getSpecialtyColor(especialidadeData.nome);
  const path = '/especialidades';

  try {
    const data = await post(path, {
      nome: especialidadeData.nome,
      color: colorToSave,
    });
    return data as Especialidade;
  } catch (error) {
    console.error('Erro ao salvar especialidade:', error);
    throw error;
  }
};
