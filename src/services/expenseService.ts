
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { mapExpenseRowToExpense, Expense } from '@/utils/expenseUtils';

type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

export const fetchExpensesFromDB = async (expenseCategory: 'personal' | 'company'): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('expense_category', expenseCategory)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapExpenseRowToExpense);
};

export const createExpenseInDB = async (expenseData: ExpenseInsert) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createMultipleExpensesInDB = async (expenses: ExpenseInsert[]) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expenses)
    .select();

  if (error) throw error;
  return data;
};

export const updateExpenseInDB = async (id: string, updates: Partial<Expense>) => {
  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteExpenseFromDB = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const deleteExpensesByCondition = async (condition: { 
  parent_expense_id?: string; 
  date_gte?: string;
  installment_current_gte?: number;
}) => {
  let query = supabase.from('expenses').delete();
  
  if (condition.parent_expense_id) {
    query = query.eq('parent_expense_id', condition.parent_expense_id);
  }
  
  if (condition.date_gte) {
    query = query.gte('date', condition.date_gte);
  }

  if (condition.installment_current_gte) {
    query = query.gte('installment_current', condition.installment_current_gte);
  }

  const { error } = await query;
  if (error) throw error;
};

export const deleteInstallmentExpensesFromCurrent = async (parentId: string, currentInstallment: number) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .or(`id.eq.${parentId},and(parent_expense_id.eq.${parentId},installment_current.gte.${currentInstallment})`);

  if (error) throw error;
};

export const updateExpensesByCondition = async (
  condition: { parent_expense_id?: string; date_gte?: string; },
  updates: Partial<Expense>
) => {
  let query = supabase.from('expenses').update(updates);
  
  if (condition.parent_expense_id) {
    query = query.eq('parent_expense_id', condition.parent_expense_id);
  }
  
  if (condition.date_gte) {
    query = query.gte('date', condition.date_gte);
  }

  const { error } = await query;
  if (error) throw error;
};

export const getExpenseById = async (id: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const countExpensesByCondition = async (condition: { parent_expense_id: string }) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('id')
    .eq('parent_expense_id', condition.parent_expense_id);

  if (error) throw error;
  return data?.length || 0;
};

export const checkExistingExpensesByParentAndDateRange = async (
  parentId: string, 
  startDate: string, 
  endDate: string
) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('date')
    .eq('parent_expense_id', parentId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;
  return data || [];
};

export const checkExistingExpensesByTitleAndValue = async (
  title: string,
  amount: number,
  expenseCategory: 'personal' | 'company',
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('date, title, amount')
    .eq('expense_category', expenseCategory)
    .eq('title', title)
    .eq('amount', amount)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;
  return data || [];
};

export const unpaidAllFutureExpenses = async (expenseCategory: 'personal' | 'company') => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('expenses')
    .update({ paid: false })
    .eq('expense_category', expenseCategory)
    .gte('date', currentDate);

  if (error) throw error;
};
