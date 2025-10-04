import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CashFlowEntry } from "@/hooks/useCashFlow";

interface CashFlowCardProps {
  entry: CashFlowEntry;
  onDelete: (id: string) => void;
  onEdit?: (entry: CashFlowEntry) => void;
  onDuplicate?: (entry: CashFlowEntry) => void;
}

export const CashFlowCard = ({ entry, onDelete, onEdit, onDuplicate }: CashFlowCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{entry.title}</CardTitle>
          <CardDescription className="text-sm">
            {entry.description}
          </CardDescription>
          <CardDescription className="text-xs">
            {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={entry.type === 'entrada' ? 'default' : 'destructive'}>
            {entry.type === 'entrada' ? 'Entrada' : 'Saída'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-semibold ${
            entry.type === 'entrada' ? 'text-green-600' : 'text-red-600'
          }`}>
            {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(Number(entry.amount))}
          </span>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(entry)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(entry)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};