
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

  const createMultipleMonthlyExpenses = async (expense: Omit<Expense, 'id'>, monthsToCreate: number = 12) => {
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
        installment_total: null,
        installment_current: null,
        is_recurring: true,
        parent_expense_id: null,
        recurring_day: expense.recurring_day || null,
      };

      // Criar a despesa principal (template)
      const { data: mainExpense, error: mainError } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (mainError) throw mainError;

      console.log(`Criando despesas mensais para ${monthsToCreate} meses futuros`);

      // Criar despesas para os próximos meses
      const futureExpenses = [];
      const baseDate = new Date(expense.date);
      
      for (let i = 1; i <= monthsToCreate; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        
        // Se há um dia específico, ajustar
        if (expense.recurring_day) {
          futureDate.setDate(expense.recurring_day);
        }

        futureExpenses.push({
          ...expenseData,
          date: futureDate.toISOString().split('T')[0],
          is_recurring: false,
          parent_expense_id: mainExpense.id,
        });
      }

      if (futureExpenses.length > 0) {
        const { error: futureError } = await supabase
          .from('expenses')
          .insert(futureExpenses);

        if (futureError) throw futureError;
        console.log(`${futureExpenses.length} despesas mensais criadas com sucesso`);
      }

      await fetchExpenses();
      return mainExpense;
    } catch (error) {
      console.error('Erro ao criar despesas mensais:', error);
      throw error;
    }
  };

  const createInstallmentExpenses = async (expense: Omit<Expense, 'id'>) => {
    try {
      if (!expense.installment_total || !expense.installment_current) {
        throw new Error('Dados de parcelamento inválidos');
      }

      console.log(`Criando ${expense.installment_total} parcelas da despesa ${expense.title}`);

      const installmentExpenses = [];
      const baseDate = new Date(expense.date);
      
      for (let i = 0; i < expense.installment_total; i++) {
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        const expenseData: ExpenseInsert = {
          title: `${expense.title} (${i + 1}/${expense.installment_total})`,
          amount: expense.amount,
          category: expense.category,
          type: expense.type,
          expense_category: expenseCategory,
          date: installmentDate.toISOString().split('T')[0],
          description: expense.description || null,
          paid: expense.paid || false,
          installment_total: expense.installment_total,
          installment_current: i + 1,
          is_recurring: false,
          parent_expense_id: i === 0 ? null : undefined,
          recurring_day: null,
        };

        installmentExpenses.push(expenseData);
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert(installmentExpenses)
        .select();

      if (error) throw error;

      console.log(`${installmentExpenses.length} parcelas criadas com sucesso`);
      await fetchExpenses();
      return data;
    } catch (error) {
      console.error('Erro ao criar despesas parceladas:', error);
      throw error;
    }
  };

  const replicateMonthlyExpenseToFuture = async (expenseId: string) => {
    try {
      // Buscar a despesa original
      const { data: originalExpense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (fetchError || !originalExpense) throw fetchError || new Error('Despesa not found');

      const baseDate = new Date(originalExpense.date);
      const currentDate = new Date();
      
      // Criar despesas para os próximos 12 meses a partir do mês atual
      const futureExpenses = [];
      
      for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        
        // Usar o mesmo dia da despesa original
        if (originalExpense.recurring_day) {
          futureDate.setDate(originalExpense.recurring_day);
        } else {
          futureDate.setDate(baseDate.getDate());
        }

        const expenseData: ExpenseInsert = {
          title: originalExpense.title,
          amount: originalExpense.amount,
          category: originalExpense.category,
          type: originalExpense.type,
          expense_category: originalExpense.expense_category,
          date: futureDate.toISOString().split('T')[0],
          description: originalExpense.description,
          paid: false,
          installment_total: null,
          installment_current: null,
          is_recurring: false,
          parent_expense_id: originalExpense.parent_expense_id || originalExpense.id,
          recurring_day: originalExpense.recurring_day,
        };

        futureExpenses.push(expenseData);
      }

      if (futureExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert(futureExpenses);

        if (insertError) throw insertError;
        console.log(`${futureExpenses.length} despesas mensais replicadas para o futuro`);
        
        await fetchExpenses();
        
        toast({
          title: "Sucesso",
          description: `Despesa replicada para ${futureExpenses.length} meses futuros!`,
        });
      }
    } catch (error) {
      console.error('Erro ao replicar despesa mensal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível replicar a despesa mensal",
        variant: "destructive",
      });
    }
  };

  const replicateInstallmentExpenseToFuture = async (expenseId: string) => {
    try {
      const { data: originalExpense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (fetchError || !originalExpense) throw fetchError || new Error('Despesa not found');

      if (!originalExpense.installment_total || !originalExpense.installment_current) {
        throw new Error('Dados de parcelamento inválidos');
      }

      const baseDate = new Date(originalExpense.date);
      const remainingInstallments = originalExpense.installment_total - originalExpense.installment_current;
      
      if (remainingInstallments <= 0) {
        toast({
          title: "Aviso",
          description: "Esta despesa parcelada já foi totalmente replicada",
        });
        return;
      }

      const futureExpenses = [];
      
      for (let i = 1; i <= remainingInstallments; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setMonth(futureDate.getMonth() + i);

        const currentInstallment = originalExpense.installment_current + i;

        const expenseData: ExpenseInsert = {
          title: `${originalExpense.title.replace(/ \(\d+\/\d+\)$/, '')} (${currentInstallment}/${originalExpense.installment_total})`,
          amount: originalExpense.amount,
          category: originalExpense.category,
          type: originalExpense.type,
          expense_category: originalExpense.expense_category,
          date: futureDate.toISOString().split('T')[0],
          description: originalExpense.description,
          paid: false,
          installment_total: originalExpense.installment_total,
          installment_current: currentInstallment,
          is_recurring: false,
          parent_expense_id: originalExpense.parent_expense_id || originalExpense.id,
          recurring_day: null,
        };

        futureExpenses.push(expenseData);
      }

      if (futureExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert(futureExpenses);

        if (insertError) throw insertError;
        console.log(`${futureExpenses.length} parcelas replicadas para o futuro`);
        
        await fetchExpenses();
        
        toast({
          title: "Sucesso",
          description: `${futureExpenses.length} parcelas replicadas para os meses futuros!`,
        });
      }
    } catch (error) {
      console.error('Erro ao replicar despesa parcelada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível replicar a despesa parcelada",
        variant: "destructive",
      });
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      if (expense.type === 'monthly') {
        await createMultipleMonthlyExpenses(expense, 12);
      } else if (expense.type === 'installment') {
        await createInstallmentExpenses(expense);
      } else {
        // Despesa casual
        const expenseData: ExpenseInsert = {
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          type: expense.type,
          expense_category: expenseCategory,
          date: expense.date,
          description: expense.description || null,
          paid: expense.paid || false,
          installment_total: null,
          installment_current: null,
          is_recurring: false,
          parent_expense_id: null,
          recurring_day: null,
        };

        const { data, error } = await supabase
          .from('expenses')
          .insert([expenseData])
          .select()
          .single();

        if (error) throw error;
        await fetchExpenses();
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

      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!",
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
      // Buscar a despesa para verificar se é monthly
      const { data: expense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (expense.type === 'monthly') {
        // Para despesas mensais, deletar também as futuras (não as passadas)
        const currentDate = new Date();
        const expenseDate = new Date(expense.date);
        
        if (expense.parent_expense_id) {
          // Se é uma despesa filha, deletar ela e todas as futuras do mesmo parent
          const { error: deleteError } = await supabase
            .from('expenses')
            .delete()
            .eq('parent_expense_id', expense.parent_expense_id)
            .gte('date', currentDate.toISOString().split('T')[0]);

          if (deleteError) throw deleteError;

          // Deletar a despesa atual também
          const { error: deleteCurrentError } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

          if (deleteCurrentError) throw deleteCurrentError;
        } else {
          // Se é uma despesa pai (template), deletar todas as despesas filhas futuras
          const { error: deleteChildrenError } = await supabase
            .from('expenses')
            .delete()
            .eq('parent_expense_id', id)
            .gte('date', currentDate.toISOString().split('T')[0]);

          if (deleteChildrenError) throw deleteChildrenError;

          // Deletar a despesa principal
          const { error: deleteParentError } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

          if (deleteParentError) throw deleteParentError;
        }
      } else {
        // Para outras despesas, deletar normalmente
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
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
    replicateMonthlyExpenseToFuture,
    replicateInstallmentExpenseToFuture,
    refetch: fetchExpenses,
  };
};
