
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

export const mapExpenseRowToExpense = (row: ExpenseRow): Expense => ({
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

export const createExpenseInsert = (
  expense: Omit<Expense, 'id'>,
  expenseCategory: 'personal' | 'company'
): ExpenseInsert => ({
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  type: expense.type,
  expense_category: expenseCategory,
  date: expense.date,
  description: expense.description || null,
  paid: expense.paid || false,
  installment_total: expense.installment_total || null,
  installment_current: expense.installment_current || null,
  is_recurring: expense.is_recurring || false,
  parent_expense_id: expense.parent_expense_id || null,
  recurring_day: expense.recurring_day || null,
});
