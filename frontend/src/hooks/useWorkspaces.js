import { useState, useEffect, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService.js';

// Hook para gerenciar workspaces
export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar workspaces
  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.getWorkspaces();
      setWorkspaces(response.workspaces || []);
      
      // Se houver workspaces e nenhum estiver selecionado, selecionar o primeiro
      if (response.workspaces?.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(response.workspaces[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  // Carregar workspace específico
  const loadWorkspace = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.getWorkspace(id);
      setCurrentWorkspace(response.workspace);
      return response.workspace;
    } catch (error) {
      console.error('Failed to load workspace:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo workspace
  const createWorkspace = useCallback(async (workspaceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.createWorkspace(workspaceData);
      const newWorkspace = response.workspace;
      
      // Adicionar à lista e definir como atual
      setWorkspaces(prev => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      
      return newWorkspace;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar workspace
  const updateWorkspace = useCallback(async (id, workspaceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.updateWorkspace(id, workspaceData);
      const updatedWorkspace = response.workspace;
      
      // Atualizar na lista
      setWorkspaces(prev => 
        prev.map(ws => ws.id === id ? updatedWorkspace : ws)
      );
      
      // Atualizar workspace atual se for o mesmo
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      return updatedWorkspace;
    } catch (error) {
      console.error('Failed to update workspace:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  // Deletar workspace
  const deleteWorkspace = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await workspaceService.deleteWorkspace(id);
      
      // Remover da lista
      setWorkspaces(prev => prev.filter(ws => ws.id !== id));
      
      // Se o workspace atual foi deletado, limpar
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(null);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  // Carregar workspaces ao montar o hook
  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  return {
    workspaces,
    currentWorkspace,
    loading,
    error,
    loadWorkspaces,
    loadWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
  };
};
