
import { supabase } from '@/integrations/supabase/client';

export const createMonthlyExpenses = async () => {
  try {
    const { error } = await supabase.rpc('create_monthly_expenses');
    if (error) throw error;
    console.log('Despesas mensais criadas automaticamente via RPC');
  } catch (error) {
    console.error('Erro ao criar despesas mensais automaticamente:', error);
  }
};

// Função para marcar despesas existentes como recorrentes e criar futuras
export const markExistingMonthlyAsRecurring = async () => {
  try {
    console.log('Iniciando processo de marcação de despesas existentes como recorrentes...');
    
    // Buscar TODAS as despesas mensais, independente do status de recorrência
    const { data: allMonthlyExpenses, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('type', 'monthly');
    
    if (fetchError) throw fetchError;
    
    console.log(`Total de despesas mensais encontradas: ${allMonthlyExpenses?.length || 0}`);
    
    if (!allMonthlyExpenses || allMonthlyExpenses.length === 0) {
      console.log('Nenhuma despesa mensal encontrada no sistema');
      return;
    }
    
    // Filtrar despesas que são "pais" (não são filhas de outras despesas)
    const parentExpenses = allMonthlyExpenses.filter(expense => !expense.parent_expense_id);
    console.log(`Despesas mensais principais (não duplicadas): ${parentExpenses.length}`);
    
    // Separar despesas que ainda não são recorrentes
    const nonRecurringExpenses = parentExpenses.filter(expense => !expense.is_recurring);
    console.log(`Despesas mensais que precisam ser marcadas como recorrentes: ${nonRecurringExpenses.length}`);
    
    if (nonRecurringExpenses.length > 0) {
      // Marcar todas as despesas mensais principais como recorrentes
      for (const expense of nonRecurringExpenses) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update({ is_recurring: true })
          .eq('id', expense.id);
        
        if (updateError) {
          console.error(`Erro ao marcar despesa ${expense.title} como recorrente:`, updateError);
        } else {
          console.log(`Despesa "${expense.title}" marcada como recorrente`);
        }
      }
      
      // Aguardar para garantir que as atualizações foram processadas
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Agora criar as despesas futuras usando a função RPC
    console.log('Criando despesas futuras...');
    await createMonthlyExpenses();
    
    console.log('Processo completo: despesas mensais marcadas como recorrentes e futuras criadas');
  } catch (error) {
    console.error('Erro ao processar despesas mensais existentes:', error);
  }
};

// Esta função pode ser chamada periodicamente ou quando o usuário navegar entre meses
export const ensureMonthlyExpensesExist = async () => {
  console.log('Garantindo que despesas mensais existam...');
  await createMonthlyExpenses();
};

// Função para processar despesas existentes - chamada uma única vez
export const processExistingExpenses = async () => {
  try {
    // Verificar se já processamos as despesas existentes
    const processedKey = 'monthly_expenses_processed_v2'; // Mudei a versão para reprocessar
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
  localStorage.removeItem('monthly_expenses_processed_v2');
  await processExistingExpenses();
};

// Função adicional para debug - verificar despesas no banco
export const debugExpenses = async () => {
  try {
    const { data: allExpenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('=== DEBUG: Todas as despesas ===');
    console.log(`Total de despesas: ${allExpenses?.length || 0}`);
    
    const monthlyExpenses = allExpenses?.filter(e => e.type === 'monthly') || [];
    console.log(`Despesas mensais: ${monthlyExpenses.length}`);
    
    const recurringExpenses = monthlyExpenses.filter(e => e.is_recurring);
    console.log(`Despesas recorrentes: ${recurringExpenses.length}`);
    
    const parentExpenses = monthlyExpenses.filter(e => !e.parent_expense_id);
    console.log(`Despesas principais (pais): ${parentExpenses.length}`);
    
    console.log('Detalhes das despesas mensais:', monthlyExpenses);
    
  } catch (error) {
    console.error('Erro ao fazer debug das despesas:', error);
  }
};
