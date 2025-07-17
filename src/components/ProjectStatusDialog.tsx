import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface ProjectStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statusData: any) => void;
  currentStatus: string;
  projectName: string;
}

const predefinedReasons = [
  'Orçamento acima do limite',
  'Informações incompletas',
  'Prazo inviável',
  'Falta de recursos',
  'Requisitos não atendidos',
  'Cliente não aprovou',
  'Questões técnicas',
  'Documentação insuficiente'
];

const ProjectStatusDialog: React.FC<ProjectStatusDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  projectName
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setSelectedReasons(prev => [...prev, reason]);
    } else {
      setSelectedReasons(prev => prev.filter(r => r !== reason));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const statusData: any = { status: selectedStatus };
    
    if (selectedStatus === 'rejected') {
      if (selectedReasons.length === 0) {
        alert('Selecione pelo menos um motivo para a reprovação.');
        return;
      }
      statusData.rejection_reasons = selectedReasons;
      statusData.rejection_observations = observations;
    } else {
      // Clear rejection data when not rejected
      statusData.rejection_reasons = null;
      statusData.rejection_observations = null;
    }

    onSave(statusData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold">
            Alterar Status do Projeto
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Projeto: <span className="font-medium">{projectName}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Novo Status</Label>
              <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="status-pending" />
                  <Label htmlFor="status-pending">Pendente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="status-approved" />
                  <Label htmlFor="status-approved">Aprovado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="status-rejected" />
                  <Label htmlFor="status-rejected">Reprovado</Label>
                </div>
              </RadioGroup>
            </div>

            {selectedStatus === 'rejected' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Motivos da Reprovação *
                  </Label>
                  <div className="space-y-2">
                    {predefinedReasons.map((reason) => (
                      <div key={reason} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reason-${reason}`}
                          checked={selectedReasons.includes(reason)}
                          onCheckedChange={(checked) => handleReasonChange(reason, checked as boolean)}
                        />
                        <Label htmlFor={`reason-${reason}`} className="text-sm">
                          {reason}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Adicionais</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Digite observações adicionais sobre a reprovação..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Salvar Status
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStatusDialog;