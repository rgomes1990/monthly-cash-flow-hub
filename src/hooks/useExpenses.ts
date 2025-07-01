
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'monthly' | 'installment' | 'casual';
  expense_category: 'personal' | 'company';
  date: string;
  description?: string;
  paid?: boolean;
  installment_total?: number;
  installment_current?: number;
  is_recurring?: boolean;
  parent_expense_id?: string;
  recurring_day?: number;
}

const mapExpenseRowToExpense = (row: ExpenseRow): Expense => ({
  id: row.id,
  title: row.title,
  amount: row.amount,
  category: row.category,
  type: row.type as 'monthly' | 'installment' | 'casual',
  expense_category: row.expense_category as 'personal' | 'company',
  date: row.date,
  description: row.description || undefined,
  paid: row.paid || false,
  installment_total: row.installment_total || undefined,
  installment_current: row.installment_current || undefined,
  is_recurring: row.is_recurring || false,
  parent_expense_id: row.parent_expense_id || undefined,
  recurring_day: row.recurring_day || undefined,
});

export const useExpenses = (expenseCategory: 'personal' | 'company') => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('expense_category', expenseCategory)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mappedExpenses = (data || []).map(mapExpenseRowToExpense);
      setExpenses(mappedExpenses);
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

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const expenseData: ExpenseInsert = {
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        type: expense.type,
        expense_category: expenseCategory,
        date: expense.date,
        description: expense.description || null,
        paid: expense.paid || false,
        installment_total: expense.type === 'installment' ? expense.installment_total || null : null,
        installment_current: expense.type === 'installment' ? expense.installment_current || null : null,
        is_recurring: expense.type === 'monthly' ? true : false,
        parent_expense_id: null,
        recurring_day: expense.recurring_day || null,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      
      const mappedExpense = mapExpenseRowToExpense(data);
      setExpenses(prev => [mappedExpense, ...prev]);
      
      // Se é uma despesa mensal, criar automaticamente para os próximos meses
      if (expense.type === 'monthly') {
        await createRecurringExpenses();
      }
      
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

  const createRecurringExpenses = async () => {
    try {
      // Chamar a função melhorada do banco para criar despesas recorrentes
      const { error } = await supabase.rpc('mark_existing_monthly_as_recurring');
      if (error) throw error;
      
      // Recarregar as despesas para mostrar as novas criadas
      await fetchExpenses();
    } catch (error) {
      console.error('Erro ao criar despesas recorrentes:', error);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      ));
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
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Sucesso",
        description: "Despesa removida com sucesso!",
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
    refetch: fetchExpenses,
  };
};
