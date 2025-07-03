import { useToast } from '@/hooks/use-toast';
import { Expense, createExpenseInsert } from '@/utils/expenseUtils';
import { 
  createExpenseInDB, 
  createMultipleExpensesInDB, 
  getExpenseById,
  updateExpenseInDB,
  updateExpensesByCondition,
  deleteExpenseFromDB,
  deleteExpensesByCondition,
  countExpensesByCondition,
  checkExistingExpensesByParentAndDateRange
} from '@/services/expenseService';

export const useMonthlyExpenseOperations = (
  expenseCategory: 'personal' | 'company',
  refetch: () => Promise<void>
) => {
  const { toast } = useToast();

  const createMultipleMonthlyExpenses = async (expense: Omit<Expense, 'id'>, monthsToCreate: number = 12) => {
    const expenseData = createExpenseInsert(expense, expenseCategory);
    expenseData.is_recurring = true;

    // Criar a despesa principal (template)
    const mainExpense = await createExpenseInDB(expenseData);
    console.log(`Criando despesas mensais para ${monthsToCreate} meses futuros`);

    // Criar despesas para os próximos meses
    const futureExpenses = [];
    const baseDate = new Date(expense.date);
    
    for (let i = 1; i <= monthsToCreate; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
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
      await createMultipleExpensesInDB(futureExpenses);
      console.log(`${futureExpenses.length} despesas mensais criadas com sucesso`);
    }

    return mainExpense;
  };

  const replicateMonthlyExpenseToFuture = async (expenseId: string) => {
    try {
      const originalExpense = await getExpenseById(expenseId);
      const currentDate = new Date();
      
      // Determinar o parent_expense_id correto
      const parentId = originalExpense.parent_expense_id || originalExpense.id;
      
      // Verificar se já existem despesas futuras para evitar duplicação
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 12);
      
      const existingFutureExpenses = await checkExistingExpensesByParentAndDateRange(
        parentId,
        currentDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const existingDates = new Set(existingFutureExpenses.map(exp => exp.date));
      const futureExpenses = [];
      
      for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        
        if (originalExpense.recurring_day) {
          futureDate.setDate(originalExpense.recurring_day);
        } else {
          const baseDate = new Date(originalExpense.date);
          futureDate.setDate(baseDate.getDate());
        }

        const futureDateString = futureDate.toISOString().split('T')[0];
        
        // Só adicionar se não existir uma despesa para esta data
        if (!existingDates.has(futureDateString)) {
          futureExpenses.push(createExpenseInsert({
            title: originalExpense.title,
            amount: originalExpense.amount,
            category: originalExpense.category,
            type: originalExpense.type as 'monthly' | 'installment' | 'casual',
            expense_category: originalExpense.expense_category as 'personal' | 'company',
            date: futureDateString,
            description: originalExpense.description || undefined,
            paid: false,
            is_recurring: false,
            parent_expense_id: parentId,
            recurring_day: originalExpense.recurring_day || undefined,
          }, expenseCategory));
        }
      }

      if (futureExpenses.length > 0) {
        await createMultipleExpensesInDB(futureExpenses);
        console.log(`${futureExpenses.length} despesas mensais replicadas para o futuro`);
        
        await refetch();
        
        toast({
          title: "Sucesso",
          description: `${futureExpenses.length} despesas novas replicadas para os meses futuros!`,
        });
      } else {
        toast({
          title: "Aviso",
          description: "Todas as despesas já foram replicadas para os meses futuros.",
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

  const updateMonthlyExpense = async (id: string, updates: Partial<Expense>) => {
    const expense = await getExpenseById(id);
    const currentDate = new Date();
    const expenseDate = new Date(expense.date);
    
    // Atualizar a despesa atual
    await updateExpenseInDB(id, updates);

    // Se é uma despesa pai (template), atualizar todas as filhas futuras
    if (expense.parent_expense_id === null && expense.is_recurring) {
      await updateExpensesByCondition({
        parent_expense_id: id,
        date_gte: currentDate.toISOString().split('T')[0]
      }, updates);
    } else if (expense.parent_expense_id) {
      // Se é uma despesa filha, atualizar ela e todas as futuras do mesmo parent
      await updateExpensesByCondition({
        parent_expense_id: expense.parent_expense_id,
        date_gte: expenseDate.toISOString().split('T')[0]
      }, updates);

      // Também atualizar o parent se necessário
      await updateExpenseInDB(expense.parent_expense_id, updates);
    }
  };

  const deleteMonthlyExpense = async (id: string) => {
    const expense = await getExpenseById(id);
    const currentDate = new Date();
    const expenseDate = new Date(expense.date);
    
    if (expense.parent_expense_id === null && expense.is_recurring) {
      // Se é uma despesa pai (template), deletar todas as despesas filhas futuras (incluindo hoje)
      await deleteExpensesByCondition({
        parent_expense_id: id,
        date_gte: currentDate.toISOString().split('T')[0]
      });

      // Deletar a despesa principal
      await deleteExpenseFromDB(id);
    } else if (expense.parent_expense_id) {
      // Se é uma despesa filha, deletar ela e todas as futuras do mesmo parent (incluindo hoje)
      await deleteExpensesByCondition({
        parent_expense_id: expense.parent_expense_id,
        date_gte: expenseDate.toISOString().split('T')[0]
      });

      // Se não há mais despesas filhas, deletar o parent também
      const remainingCount = await countExpensesByCondition({
        parent_expense_id: expense.parent_expense_id
      });

      if (remainingCount === 0) {
        await deleteExpenseFromDB(expense.parent_expense_id);
      }
    } else {
      // Deletar a despesa atual se não tem parent_expense_id
      await deleteExpenseFromDB(id);
    }
  };

  return {
    createMultipleMonthlyExpenses,
    replicateMonthlyExpenseToFuture,
    updateMonthlyExpense,
    deleteMonthlyExpense,
  };
};
