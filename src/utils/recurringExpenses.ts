
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

// Função para marcar despesas existentes como recorrentes
export const markExistingMonthlyAsRecurring = async () => {
  try {
    console.log('Iniciando processo de marcação de despesas existentes como recorrentes...');
    
    // Primeiro, buscar todas as despesas mensais que ainda não são recorrentes
    const { data: existingMonthlyExpenses, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('type', 'monthly')
      .is('parent_expense_id', null)
      .or('is_recurring.is.null,is_recurring.eq.false');
    
    if (fetchError) throw fetchError;
    
    console.log(`Encontradas ${existingMonthlyExpenses?.length || 0} despesas mensais para processar`);
    
    if (existingMonthlyExpenses && existingMonthlyExpenses.length > 0) {
      // Marcar todas as despesas mensais existentes como recorrentes
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ is_recurring: true })
        .eq('type', 'monthly')
        .is('parent_expense_id', null)
        .or('is_recurring.is.null,is_recurring.eq.false');
      
      if (updateError) throw updateError;
      console.log('Despesas mensais marcadas como recorrentes');
      
      // Aguardar um pouco para garantir que a atualização foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Depois criar as despesas futuras
    await createMonthlyExpenses();
    
    console.log('Despesas mensais existentes marcadas como recorrentes e futuras criadas');
  } catch (error) {
    console.error('Erro ao processar despesas mensais existentes:', error);
  }
};

// Esta função pode ser chamada periodicamente ou quando o usuário navegar entre meses
export const ensureMonthlyExpensesExist = async () => {
  await createMonthlyExpenses();
};

// Função para processar despesas existentes - chamada uma única vez
export const processExistingExpenses = async () => {
  try {
    // Verificar se já processamos as despesas existentes
    const processedKey = 'monthly_expenses_processed';
    const alreadyProcessed = localStorage.getItem(processedKey);
    
    if (!alreadyProcessed) {
      console.log('Processando despesas existentes pela primeira vez...');
      await markExistingMonthlyAsRecurring();
      localStorage.setItem(processedKey, 'true');
    } else {
      console.log('Despesas já foram processadas anteriormente, apenas criando novas se necessário...');
      await ensureMonthlyExpensesExist();
    }
  } catch (error) {
    console.error('Erro ao processar despesas existentes:', error);
  }
};

// Função para forçar reprocessamento (útil para debug)
export const forceReprocessExistingExpenses = async () => {
  localStorage.removeItem('monthly_expenses_processed');
  await processExistingExpenses();
};
