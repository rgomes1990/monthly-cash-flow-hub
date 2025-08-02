import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlixSubscription, useFlixSubscriptions } from '@/hooks/useFlixSubscriptions';
import FlixForm from './FlixForm';

interface FlixCardProps {
  subscription: FlixSubscription;
}

const FlixCard: React.FC<FlixCardProps> = ({ subscription }) => {
  const { deleteSubscription } = useFlixSubscriptions();
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir todas as mensalidades deste cliente a partir deste mês?')) {
      await deleteSubscription(subscription.client_name, subscription.month_year);
    }
  };

  // Formatação da data para garantir o mês correto
  const formatMonth = (dateString: string) => {
    // Cria a data com horário específico para evitar problemas de timezone
    const date = new Date(dateString + 'T12:00:00');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (showEditForm) {
    return (
      <FlixForm
        onClose={() => setShowEditForm(false)}
        subscription={subscription}
      />
    );
  }

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {subscription.client_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Valor Mensal:</span>
            <span className="font-semibold text-green-600">
              R$ {Number(subscription.monthly_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Mês:</span>
            <span className="font-medium text-gray-800">
              {formatMonth(subscription.month_year)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(true)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlixCard;