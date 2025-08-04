
import React, { useState } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, DollarSign, Building2, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ExpenseForm from '@/components/ExpenseForm';
import MonthlyExpenses from '@/components/MonthlyExpenses';
import InstallmentExpenses from '@/components/InstallmentExpenses';
import CasualExpenses from '@/components/CasualExpenses';
import ExpenseChart from '@/components/ExpenseChart';
import MonthNavigator from '@/components/MonthNavigatorEnhanced';
import { useExpenses } from '@/hooks/useExpenses';

const Index = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenseFilter, setExpenseFilter] = useState<'personal' | 'company'>('personal');
  
  const { 
    expenses, 
    loading, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    replicateMonthlyExpenseToFuture,
    replicateInstallmentExpenseToFuture 
  } = useExpenses(expenseFilter);

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === currentMonth.getFullYear() && 
           expenseDate.getMonth() === currentMonth.getMonth();
  });

  const monthlyExpenses = currentMonthExpenses.filter(e => e.type === 'monthly');
  const installmentExpenses = currentMonthExpenses.filter(e => e.type === 'installment');
  const casualExpenses = currentMonthExpenses.filter(e => e.type === 'casual');

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInstallment = installmentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCasual = casualExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalMonthly + totalInstallment + totalCasual;

  const handleAddExpense = (expense: any) => {
    addExpense({
      ...expense,
      installment_total: expense.installments?.total,
      installment_current: expense.installments?.current,
      recurring_day: expense.recurring_day,
    });
    setShowExpenseForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Controle de Despesas
            </h1>
            <p className="text-gray-600">
              Gerencie suas finanças de forma inteligente
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/projects')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Building2 className="w-4 h-4 mr-2" />
              PROJETOS
            </Button>
            <Button 
              onClick={() => navigate('/flut')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Calendar className="w-4 h-4 mr-2" />
              FLUT
            </Button>
            <Button 
              onClick={() => navigate('/flix')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              FLIX
            </Button>
            <Button 
              onClick={() => navigate('/resumo')}
              variant="outline"
              className="shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <PieChart className="w-4 h-4 mr-2" />
              RESUMO
            </Button>
            <Button 
              onClick={() => setShowExpenseForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Expense Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrar Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={expenseFilter} 
              onValueChange={(value: 'personal' | 'company') => setExpenseFilter(value)}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="filter-personal" />
                <Label htmlFor="filter-personal" className="text-base">Despesas Pessoais</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="filter-company" />
                <Label htmlFor="filter-company" className="text-base">Despesas da Empresa</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Month Navigator */}
        <MonthNavigator 
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {expenseFilter === 'personal' ? 'Despesas Pessoais' : 'Despesas da Empresa'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Despesas Fixas
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {totalMonthly.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Parceladas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {totalInstallment.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Despesas Avulsas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {totalCasual.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="monthly">Fixas</TabsTrigger>
            <TabsTrigger value="installment">Parceladas</TabsTrigger>
            <TabsTrigger value="casual">Avulsas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ExpenseChart 
              monthlyTotal={totalMonthly}
              installmentTotal={totalInstallment}
              casualTotal={totalCasual}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyExpenses 
              expenses={monthlyExpenses}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              onReplicateToFuture={replicateMonthlyExpenseToFuture}
            />
          </TabsContent>

          <TabsContent value="installment">
            <InstallmentExpenses 
              expenses={installmentExpenses}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              onReplicateToFuture={replicateInstallmentExpenseToFuture}
            />
          </TabsContent>

          <TabsContent value="casual">
            <CasualExpenses 
              expenses={casualExpenses}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
            />
          </TabsContent>
        </Tabs>

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <ExpenseForm 
            onSave={handleAddExpense}
            onCancel={() => setShowExpenseForm(false)}
            currentMonth={currentMonth}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
