import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlixSubscriptions } from '@/hooks/useFlixSubscriptions';

interface FlixFormProps {
  onClose: () => void;
  defaultMonth?: Date;
  subscription?: any;
}

const FlixForm: React.FC<FlixFormProps> = ({ 
  onClose, 
  defaultMonth = new Date(), 
  subscription 
}) => {
  const { createSubscription, updateSubscription } = useFlixSubscriptions();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: subscription?.client_name || '',
    monthlyValue: subscription?.monthly_value || '',
    monthYear: subscription?.month_year || defaultMonth.toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subscriptionData = {
        client_name: formData.clientName,
        monthly_value: parseFloat(formData.monthlyValue),
        month_year: formData.monthYear,
      };

      if (subscription) {
        await updateSubscription(subscription.id, subscriptionData);
      } else {
        await createSubscription(subscriptionData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar mensalidade:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {subscription ? 'Editar Mensalidade' : 'Nova Mensalidade FLIX'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                required
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div>
              <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
              <Input
                id="monthlyValue"
                type="number"
                step="0.01"
                value={formData.monthlyValue}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyValue: e.target.value })
                }
                required
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="monthYear">Mês/Ano</Label>
              <Input
                id="monthYear"
                type="month"
                value={formData.monthYear.substring(0, 7)}
                onChange={(e) =>
                  setFormData({ ...formData, monthYear: e.target.value + '-01' })
                }
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading 
                  ? 'Salvando...' 
                  : subscription 
                    ? 'Atualizar' 
                    : 'Criar Mensalidades'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlixForm;