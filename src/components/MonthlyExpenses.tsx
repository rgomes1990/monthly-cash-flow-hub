
import React from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'monthly' | 'installment' | 'casual';
  date: string;
  description?: string;
}

interface MonthlyExpensesProps {
  expenses: Expense[];
  onUpdate: (id: string, expense: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}

const MonthlyExpenses: React.FC<MonthlyExpensesProps> = ({ expenses, onUpdate, onDelete }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Alimentação': 'bg-green-100 text-green-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Moradia': 'bg-purple-100 text-purple-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Educação': 'bg-yellow-100 text-yellow-800',
      'Lazer': 'bg-pink-100 text-pink-800',
      'Roupas': 'bg-indigo-100 text-indigo-800',
      'Tecnologia': 'bg-gray-100 text-gray-800',
      'Outros': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalMonthly = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Despesas Mensais Fixas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            R$ {totalMonthly.toFixed(2)}
          </div>
          <p className="text-green-100 mt-1">
            {expenses.length} despesa{expenses.length !== 1 ? 's' : ''} fixa{expenses.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma despesa mensal cadastrada
            </h3>
            <p className="text-gray-600">
              Adicione suas despesas fixas mensais como aluguel, internet, etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.title}
                      </h3>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                    
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      R$ {expense.amount.toFixed(2)}
                    </div>
                    
                    {expense.description && (
                      <p className="text-gray-600 text-sm">
                        {expense.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Implementar edição
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenses;
