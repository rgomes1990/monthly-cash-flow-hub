import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { FlutForm } from "./FlutForm";
import { useFlutSubscriptions, FlutSubscription } from "@/hooks/useFlutSubscriptions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlutCardProps {
  subscription: FlutSubscription;
}

export const FlutCard = ({ subscription }: FlutCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { deleteSubscription } = useFlutSubscriptions();

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir todas as mensalidades deste cliente a partir deste mês?")) {
      setLoading(true);
      try {
        await deleteSubscription(subscription.client_name, subscription.month_year);
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
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {subscription.client_name}
            </CardTitle>
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
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
              disabled={loading}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
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