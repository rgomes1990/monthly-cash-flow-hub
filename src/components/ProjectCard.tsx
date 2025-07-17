import React, { useState } from 'react';
import { Edit, Trash2, FileText, Calendar, User, Building2, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ProjectStatusDialog from './ProjectStatusDialog';

interface ProjectCardProps {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, data: any) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onStatusChange }) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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

  const handleStatusUpdate = (statusData: any) => {
    onStatusChange(project.id, statusData);
    setShowStatusDialog(false);
  };

  return (
    <>
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(project.status)}
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o projeto "{project.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(project.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-sm font-medium text-gray-900">{project.client}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Responsável</p>
                <p className="text-sm font-medium text-gray-900">{project.responsible}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Valor Estimado</p>
                <p className="text-sm font-medium text-gray-900">
                  R$ {project.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data de Criação</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {project.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-sm text-gray-700 line-clamp-3">{project.description}</p>
            </div>
          )}

          {/* Rejection Details */}
          {project.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600 font-medium mb-1">Motivos da Reprovação:</p>
              {project.rejection_reasons && project.rejection_reasons.length > 0 && (
                <ul className="text-sm text-red-700 mb-2">
                  {project.rejection_reasons.map((reason: string, index: number) => (
                    <li key={index} className="list-disc list-inside">{reason}</li>
                  ))}
                </ul>
              )}
              {project.rejection_observations && (
                <div>
                  <p className="text-xs text-red-600 font-medium mb-1">Observações:</p>
                  <p className="text-sm text-red-700">{project.rejection_observations}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStatusDialog(true)}
            >
              Alterar Status
            </Button>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <FileText className="w-3 h-3" />
              <span>0 documentos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onSave={handleStatusUpdate}
        currentStatus={project.status}
        projectName={project.name}
      />
    </>
  );
};

export default ProjectCard;