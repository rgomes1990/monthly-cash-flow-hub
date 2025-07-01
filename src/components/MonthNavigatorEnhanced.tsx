
import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ensureMonthlyExpensesExist, processExistingExpenses, debugExpenses } from '@/utils/recurringExpenses';

interface MonthNavigatorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onMonthChange }) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Processar despesas existentes na primeira vez que o componente é montado
  useEffect(() => {
    const processOnMount = async () => {
      console.log('MonthNavigator montado, iniciando processamento...');
      
      // Primeiro fazer debug para ver o que temos no banco
      await debugExpenses();
      
      // Depois processar as despesas existentes
      await processExistingExpenses();
    };
    processOnMount();
  }, []); // Array vazio para executar apenas uma vez

  const handleMonthChange = async (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    onMonthChange(newDate);
    
    // Criar despesas mensais automaticamente quando navegar
    console.log('Navegando para novo mês, garantindo que despesas mensais existam...');
    await ensureMonthlyExpensesExist();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('prev')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('next')}
            className="flex items-center gap-2"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthNavigator;
