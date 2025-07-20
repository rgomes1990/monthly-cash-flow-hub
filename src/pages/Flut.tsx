import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, Users } from "lucide-react";
import { FlutForm } from "@/components/FlutForm";
import { FlutCard } from "@/components/FlutCard";
import { useFlutSubscriptions } from "@/hooks/useFlutSubscriptions";
import { format, startOfMonth, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const Flut = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { subscriptions, loading } = useFlutSubscriptions();

  // Filter subscriptions for current month
  const currentMonthSubscriptions = subscriptions.filter(sub => {
    const subMonth = startOfMonth(new Date(sub.month_year));
    const displayMonth = startOfMonth(currentMonth);
    return subMonth.getTime() === displayMonth.getTime();
  });

  // Calculate statistics
  const totalValue = currentMonthSubscriptions.reduce((sum, sub) => sum + Number(sub.monthly_value), 0);
  const uniqueClients = new Set(currentMonthSubscriptions.map(sub => sub.client_name)).size;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? addMonths(prev, -1)
        : addMonths(prev, 1)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="container mx-auto">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">FLUT - Controle de Mensalidades</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Mensalidade
          </Button>
        </div>

        {/* Month Navigator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => navigateMonth('prev')}>
                ← Mês Anterior
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <Button variant="outline" onClick={() => navigateMonth('next')}>
                Próximo Mês →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueClients}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Mensalidades do Mês</h3>
          {currentMonthSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Nenhuma mensalidade encontrada para este mês
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione uma nova mensalidade para começar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonthSubscriptions.map((subscription) => (
                <FlutCard 
                  key={subscription.id} 
                  subscription={subscription} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <FlutForm 
            onClose={() => setShowForm(false)}
            defaultMonth={currentMonth}
          />
        )}
      </div>
    </div>
  );
};

export default Flut;