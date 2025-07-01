
import { supabase } from '@/integrations/supabase/client';

export const createMonthlyExpenses = async () => {
  try {
    const { error } = await supabase.rpc('create_monthly_expenses');
    if (error) throw error;
    console.log('Despesas mensais criadas automaticamente');
  } catch (error) {
    console.error('Erro ao criar despesas mensais automaticamente:', error);
  }
};

export const markExistingMonthlyAsRecurring = async () => {
  try {
    const { error } = await supabase.rpc('mark_existing_monthly_as_recurring');
    if (error) throw error;
    console.log('Despesas mensais existentes marcadas como recorrentes e futuras criadas');
  } catch (error) {
    console.error('Erro ao processar despesas mensais existentes:', error);
  }
};

// Esta função pode ser chamada periodicamente ou quando o usuário navegar entre meses
export const ensureMonthlyExpensesExist = async () => {
  await createMonthlyExpenses();
};

// Função para processar despesas existentes
export const processExistingExpenses = async () => {
  await markExistingMonthlyAsRecurring();
};
