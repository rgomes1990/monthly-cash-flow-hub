import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CashFlowEntry } from "@/hooks/useCashFlow";

interface CashFlowEditFormProps {
  entry: CashFlowEntry;
  onSave: (id: string, updates: Partial<CashFlowEntry>) => void;
  onCancel: () => void;
}

export const CashFlowEditForm = ({ entry, onSave, onCancel }: CashFlowEditFormProps) => {
  const [formData, setFormData] = useState({
    type: entry.type,
    amount: entry.amount.toString(),
    description: entry.description,
    date: format(new Date(entry.date), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<CashFlowEntry> = {
      type: formData.type as 'entrada' | 'saida',
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      month_year: format(new Date(formData.date), 'yyyy-MM-01')
    };

    onSave(entry.id, updates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Lançamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-type">Tipo</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'entrada' | 'saida' }))}
            >
              <SelectTrigger id="edit-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do lançamento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Data</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};