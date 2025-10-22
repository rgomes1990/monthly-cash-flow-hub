
import React, { useState } from 'react';
import { ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ExpenseEditForm from '@/components/ExpenseEditForm';
import { Expense } from '@/hooks/useExpenses';

interface CasualExpensesProps {
  expenses: Expense[];
  onUpdate: (id: string, expense: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}

const CasualExpenses: React.FC<CasualExpensesProps> = ({ expenses, onUpdate, onDelete }) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
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

  const totalCasual = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handlePaidToggle = (id: string, paid: boolean) => {
    onUpdate(id, { paid });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEdit = (id: string, updates: Partial<Expense>) => {
    onUpdate(id, updates);
    setEditingExpense(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingExpenseId(id);
  };

  const handleConfirmDelete = () => {
    if (deletingExpenseId) {
      onDelete(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Despesas Avulsas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            R$ {totalCasual.toFixed(2)}
          </div>
          <p className="text-purple-100 mt-1">
            {expenses.length} despesa{expenses.length !== 1 ? 's' : ''} avulsa{expenses.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma despesa avulsa cadastrada
            </h3>
            <p className="text-gray-600">
              Adicione suas compras pontuais, gastos eventuais, etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className={`hover:shadow-lg transition-shadow duration-300 ${expense.paid ? 'bg-green-50 border-green-200' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${expense.paid ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {expense.title}
                      </h3>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                      {expense.paid && (
                        <Badge className="bg-green-100 text-green-800">
                          Pago
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`text-2xl font-bold mb-2 ${expense.paid ? 'text-green-600' : 'text-purple-600'}`}>
                      R$ {expense.amount.toFixed(2)}
                    </div>
                    
                    {expense.description && (
                      <p className="text-gray-600 text-sm">
                        {expense.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`paid-${expense.id}`}
                        checked={expense.paid || false}
                        onCheckedChange={(checked) => handlePaidToggle(expense.id, checked)}
                      />
                      <Label htmlFor={`paid-${expense.id}`} className="text-sm">
                        Pago
                      </Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingExpense && (
        <ExpenseEditForm
          expense={editingExpense}
          onSave={handleSaveEdit}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CasualExpenses;
