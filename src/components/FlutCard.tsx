import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Trash } from "lucide-react";
import { FlutForm } from "./FlutForm";
import { useFlutSubscriptions } from "@/hooks/useFlutSubscriptions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlutCardProps {
  subscription: {
    id: string;
    client_name: string;
    monthly_value: number;
    month_year: string;
    paid: boolean;
  };
}

export const FlutCard = ({ subscription }: FlutCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateSubscription, deleteSubscription } = useFlutSubscriptions();

  const handleTogglePaid = async () => {
    setLoading(true);
    try {
      await updateSubscription(subscription.id, {
        ...subscription,
        paid: !subscription.paid,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta mensalidade?")) {
      setLoading(true);
      try {
        await deleteSubscription(subscription.id);
      } catch (error) {
        console.error("Erro ao excluir mensalidade:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const monthDate = new Date(subscription.month_year);

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${
        subscription.paid ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {subscription.client_name}
            </CardTitle>
            <Badge variant={subscription.paid ? "default" : "destructive"}>
              {subscription.paid ? "Pago" : "Pendente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="font-semibold text-lg">
                R$ {Number(subscription.monthly_value).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mês:</span>
              <span className="text-sm">
                {format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={subscription.paid ? "secondary" : "default"}
              size="sm"
              onClick={handleTogglePaid}
              disabled={loading}
              className="flex-1"
            >
              {subscription.paid ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Marcar Pendente
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Marcar Pago
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
              disabled={loading}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <FlutForm
          subscription={subscription}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};