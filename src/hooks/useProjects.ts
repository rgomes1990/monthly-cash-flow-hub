import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  client: string;
  responsible: string;
  created_at: string;
  estimated_value: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reasons?: string[];
  rejection_observations?: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar projetos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data as Project, ...prev]);
      
      toast({
        title: "Sucesso!",
        description: "Projeto criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...(data as Project) } : project
      ));

      toast({
        title: "Sucesso!",
        description: "Projeto atualizado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // First delete associated documents
      await supabase
        .from('project_documents')
        .delete()
        .eq('project_id', id);

      // Delete project documents from storage
      const { data: documents } = await supabase
        .from('project_documents')
        .select('file_path')
        .eq('project_id', id);

      if (documents && documents.length > 0) {
        const filePaths = documents.map(doc => doc.file_path);
        await supabase.storage
          .from('project-documents')
          .remove(filePaths);
      }

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));

      toast({
        title: "Sucesso!",
        description: "Projeto excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};