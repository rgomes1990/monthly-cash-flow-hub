import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import MonthNavigator from "@/components/MonthNavigatorEnhanced";
import { CashFlowForm } from "@/components/CashFlowForm";
import { CashFlowCard } from "@/components/CashFlowCard";
import { useCashFlow } from "@/hooks/useCashFlow";

const Resumo = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { entries, loading, fetchEntries, addEntry, deleteEntry, getBalance } = useCashFlow();

  useEffect(() => {
    const monthYear = format(currentMonth, 'yyyy-MM-01');
    fetchEntries(monthYear);
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const balance = getBalance();
  const totalEntradas = entries
    .filter(entry => entry.type === 'entrada')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const totalSaidas = entries
    .filter(entry => entry.type === 'saida')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Resumo - Fluxo de Caixa</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Despesas
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/flut")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            FLUT
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/flix")}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            FLIX
          </Button>
        </div>
      </div>

        <MonthNavigator
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowForm onSubmit={addEntry} currentMonth={currentMonth} />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lançamentos do Mês</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum lançamento encontrado para este mês.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {entries.map((entry) => (
                <CashFlowCard
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resumo;