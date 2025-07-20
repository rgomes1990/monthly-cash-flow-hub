import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useFlutSubscriptions } from "@/hooks/useFlutSubscriptions";
import { format } from "date-fns";

interface FlutFormProps {
  onClose: () => void;
  defaultMonth?: Date;
  subscription?: any;
}

export const FlutForm = ({ onClose, defaultMonth = new Date(), subscription }: FlutFormProps) => {
  const [clientName, setClientName] = useState(subscription?.client_name || "");
  const [monthlyValue, setMonthlyValue] = useState(subscription?.monthly_value?.toString() || "");
  const [monthYear, setMonthYear] = useState(
    subscription?.month_year || format(defaultMonth, "yyyy-MM")
  );
  const [loading, setLoading] = useState(false);

  const { createSubscription, updateSubscription } = useFlutSubscriptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subscriptionData = {
        client_name: clientName,
        monthly_value: parseFloat(monthlyValue),
        month_year: `${monthYear}-01`, // Always first day of month
        paid: subscription?.paid || false,
      };

      if (subscription) {
        await updateSubscription(subscription.id, subscriptionData);
      } else {
        await createSubscription(subscriptionData);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar mensalidade:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {subscription ? "Editar Mensalidade" : "Nova Mensalidade"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite o nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
              <Input
                id="monthlyValue"
                type="number"
                step="0.01"
                min="0"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthYear">Mês/Ano</Label>
              <Input
                id="monthYear"
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : subscription ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};