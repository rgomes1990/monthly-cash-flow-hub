import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CashFlowFormProps {
  onSubmit: (entry: {
    type: 'entrada' | 'saida';
    amount: number;
    title: string;
    description: string;
    date: string;
    month_year: string;
  }) => void;
  currentMonth: Date;
}

export const CashFlowForm = ({ onSubmit, currentMonth }: CashFlowFormProps) => {
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !title || !description) {
      return;
    }

    onSubmit({
      type,
      amount: parseFloat(amount),
      title,
      description,
      date,
      month_year: format(currentMonth, 'yyyy-MM-01')
    });

    setAmount("");
    setTitle("");
    setDescription("");
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Lançamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: 'entrada' | 'saida') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do lançamento"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do lançamento"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Adicionar Lançamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};