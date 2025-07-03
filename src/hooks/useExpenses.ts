import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Expense, createExpenseInsert } from '@/utils/expenseUtils';
import { fetchExpensesFromDB, createExpenseInDB, updateExpenseInDB, deleteExpenseFromDB } from '@/services/expenseService';
import { useMonthlyExpenseOperations } from '@/hooks/useMonthlyExpenses';
import { useInstallmentExpenseOperations } from '@/hooks/useInstallmentExpenses';

export type { Expense } from '@/utils/expenseUtils';

export const useExpenses = (expenseCategory: 'personal' | 'company') => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      const data = await fetchExpensesFromDB(expenseCategory);
      setExpenses(data);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as despesas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const monthlyOps = useMonthlyExpenseOperations(expenseCategory, fetchExpenses);
  const installmentOps = useInstallmentExpenseOperations(expenseCategory, fetchExpenses);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      if (expense.type === 'monthly') {
        await monthlyOps.createMultipleMonthlyExpenses(expense, 12);
      } else if (expense.type === 'installment') {
        await installmentOps.createInstallmentExpenses(expense);
      } else {
        // Despesa casual
        const expenseData = createExpenseInsert(expense, expenseCategory);
        await createExpenseInDB(expenseData);
      }
      
      await fetchExpenses();
      
      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a despesa",
        variant: "destructive",
      });
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const expense = expenses.find(e => e.id === id);
      
      if (expense?.type === 'monthly') {
        await monthlyOps.updateMonthlyExpense(id, updates);
      } else {
        await updateExpenseInDB(id, updates);
      }

      await fetchExpenses();
      toast({
        title: "Sucesso",
        description: expense?.type === 'monthly' 
          ? "Despesa mensal atualizada em todos os meses futuros!" 
          : "Despesa atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a despesa",
        variant: "destructive",
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const expense = expenses.find(e => e.id === id);
      
      if (expense?.type === 'monthly') {
        await monthlyOps.deleteMonthlyExpense(id);
      } else {
        await deleteExpenseFromDB(id);
      }
      
      await fetchExpenses();
      toast({
        title: "Sucesso",
        description: expense?.type === 'monthly' 
          ? "Despesa mensal removida do mês atual e futuros!" 
          : "Despesa removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a despesa",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [expenseCategory]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    replicateMonthlyExpenseToFuture: monthlyOps.replicateMonthlyExpenseToFuture,
    replicateInstallmentExpenseToFuture: installmentOps.replicateInstallmentExpenseToFuture,
    refetch: fetchExpenses,
  };
};
