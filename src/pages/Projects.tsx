import React, { useState } from 'react';
import { Plus, Building2, User, Calendar, DollarSign, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProjectForm from '@/components/ProjectForm';
import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';

const Projects = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    responsible: 'all'
  });

  const { 
    projects, 
    loading, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useProjects();

  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.client !== 'all' && !project.client.toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.responsible !== 'all' && !project.responsible.toLowerCase().includes(filters.responsible.toLowerCase())) return false;
    return true;
  });

  // Get unique clients and responsibles for filter options
  const uniqueClients = [...new Set(projects.map(p => p.client))];
  const uniqueResponsibles = [...new Set(projects.map(p => p.responsible))];

  // Calculate statistics
  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'pending').length,
    approved: projects.filter(p => p.status === 'approved').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
    totalValue: projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0)
  };

  const handleAddProject = (projectData: any) => {
    addProject(projectData);
    setShowProjectForm(false);
  };

  const handleUpdateProject = (projectData: any) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
      setShowProjectForm(false);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Reprovado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Controle de Orçamentos
            </h1>
            <p className="text-gray-600">
              Gerencie orçamentos de projetos e acompanhe aprovações
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingProject(null);
              setShowProjectForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Projetos
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aprovados
              </CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats.approved}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Reprovados
              </CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Reprovado</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.client} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.responsible} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, responsible: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Responsáveis</SelectItem>
                  {uniqueResponsibles.map(responsible => (
                    <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: 'all', client: 'all', responsible: 'all' })}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="grid">Visualização em Cards</TabsTrigger>
            <TabsTrigger value="table">Visualização em Tabela</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={deleteProject}
                  onStatusChange={updateProject}
                />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum projeto encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {projects.length === 0 
                      ? "Comece criando seu primeiro projeto." 
                      : "Tente ajustar os filtros para encontrar o que procura."}
                  </p>
                  <Button onClick={() => setShowProjectForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Projeto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projeto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsável
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.client}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.responsible}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R$ {project.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusLabel(project.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(project.created_at).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Form Modal */}
        {showProjectForm && (
          <ProjectForm 
            project={editingProject}
            onSave={editingProject ? handleUpdateProject : handleAddProject}
            onCancel={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;