import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, DollarSign, Calendar, TrendingUp, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlixSubscriptions } from '@/hooks/useFlixSubscriptions';
import FlixCard from '@/components/FlixCard';
import FlixForm from '@/components/FlixForm';
import MonthNavigator from '@/components/MonthNavigatorEnhanced';

const Flix = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { subscriptions, loading } = useFlixSubscriptions();

  // Filtrar mensalidades do mês atual
  const currentMonthSubscriptions = subscriptions.filter(subscription => {
    const subscriptionDate = new Date(subscription.month_year + 'T12:00:00');
    return subscriptionDate.getMonth() === currentMonth.getMonth() &&
           subscriptionDate.getFullYear() === currentMonth.getFullYear();
  });

  // Calcular estatísticas
  const totalMonthlyValue = currentMonthSubscriptions.reduce(
    (sum, subscription) => sum + Number(subscription.monthly_value),
    0
  );

  const uniqueClients = new Set(currentMonthSubscriptions.map(sub => sub.client_name)).size;

  // Calcular valor acumulado (todos os meses até o atual)
  const accumulatedValue = subscriptions
    .filter(subscription => {
      const subscriptionDate = new Date(subscription.month_year + 'T12:00:00');
      return subscriptionDate <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    })
    .reduce((sum, subscription) => sum + Number(subscription.monthly_value), 0);

  const handleMonthChange = (newDate: Date) => {
    setCurrentMonth(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão FLIX
            </h1>
            <p className="text-gray-600">
              Gerencie mensalidades e acompanhe receitas do FLIX
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              Despesas
            </Button>
            <Button 
              onClick={() => navigate('/projects')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Projetos
            </Button>
            <Button 
              onClick={() => navigate('/flut')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              FLUT
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Mensalidade
            </Button>
          </div>
        </div>

        {/* Month Navigator */}
        <MonthNavigator currentMonth={currentMonth} onMonthChange={handleMonthChange} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Valor Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalMonthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Receita do mês selecionado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueClients}</div>
              <p className="text-xs opacity-80 mt-1">
                No mês selecionado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Valor Acumulado
              </CardTitle>
              <Calendar className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {accumulatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Até o mês selecionado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Mensalidades do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMonthSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                </div>
                <p className="text-gray-600 text-lg mb-2">
                  Nenhuma mensalidade encontrada para este mês
                </p>
                <p className="text-gray-500 text-sm">
                  Clique em "Nova Mensalidade" para adicionar uma mensalidade
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMonthSubscriptions.map((subscription) => (
                  <FlixCard key={subscription.id} subscription={subscription} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <FlixForm 
          onClose={() => setShowForm(false)} 
          defaultMonth={currentMonth}
        />
      )}
    </div>
  );
};

export default Flix;