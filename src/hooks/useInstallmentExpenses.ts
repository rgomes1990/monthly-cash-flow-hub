
import { useToast } from '@/hooks/use-toast';
import { Expense, createExpenseInsert } from '@/utils/expenseUtils';
import { 
  createMultipleExpensesInDB, 
  getExpenseById,
  deleteInstallmentExpensesFromCurrent,
  checkExistingExpensesByTitleAndValue
} from '@/services/expenseService';

export const useInstallmentExpenseOperations = (
  expenseCategory: 'personal' | 'company',
  refetch: () => Promise<void>
) => {
  const { toast } = useToast();

  const createInstallmentExpenses = async (expense: Omit<Expense, 'id'>) => {
    if (!expense.installment_total || !expense.installment_current) {
      throw new Error('Dados de parcelamento inválidos');
    }

    console.log(`Criando ${expense.installment_total} parcelas da despesa ${expense.title}`);

    const installmentExpenses = [];
    const baseDate = new Date(expense.date);
    
    for (let i = 0; i < expense.installment_total; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      const expenseData = createExpenseInsert({
        ...expense,
        title: `${expense.title} (${i + 1}/${expense.installment_total})`,
        date: installmentDate.toISOString().split('T')[0],
        installment_current: i + 1,
        parent_expense_id: i === 0 ? undefined : undefined,
      }, expenseCategory);

      installmentExpenses.push(expenseData);
    }

    const data = await createMultipleExpensesInDB(installmentExpenses);
    console.log(`${installmentExpenses.length} parcelas criadas com sucesso`);
    
    return data;
  };

  const replicateInstallmentExpenseToFuture = async (expenseId: string) => {
    try {
      const originalExpense = await getExpenseById(expenseId);

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

      // Verificar se já existem despesas com mesmo título (sem numeração) e valor
      const baseTitle = originalExpense.title.replace(/ \(\d+\/\d+\)$/, '');
      const endDate = new Date(baseDate);
      endDate.setMonth(endDate.getMonth() + remainingInstallments);
      
      const existingFutureExpenses = await checkExistingExpensesByTitleAndValue(
        baseTitle,
        originalExpense.amount,
        expenseCategory,
        baseDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Criar um set com as datas que já tem despesas similares
      const existingDates = new Set(existingFutureExpenses.map(exp => exp.date));
      const futureExpenses = [];
      
      for (let i = 1; i <= remainingInstallments; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        const futureDateString = futureDate.toISOString().split('T')[0];
        
        // Só adicionar se não existir uma despesa com mesmo título base e valor nesta data
        if (!existingDates.has(futureDateString)) {
          const currentInstallment = originalExpense.installment_current + i;

          futureExpenses.push(createExpenseInsert({
            title: `${baseTitle} (${currentInstallment}/${originalExpense.installment_total})`,
            amount: originalExpense.amount,
            category: originalExpense.category,
            type: originalExpense.type as 'monthly' | 'installment' | 'casual',
            expense_category: originalExpense.expense_category as 'personal' | 'company',
            date: futureDateString,
            description: originalExpense.description || undefined,
            paid: false,
            installment_total: originalExpense.installment_total,
            installment_current: currentInstallment,
            parent_expense_id: originalExpense.parent_expense_id || originalExpense.id,
          }, expenseCategory));
        }
      }

      if (futureExpenses.length > 0) {
        await createMultipleExpensesInDB(futureExpenses);
        console.log(`${futureExpenses.length} parcelas replicadas para o futuro`);
        
        await refetch();
        
        toast({
          title: "Sucesso",
          description: `${futureExpenses.length} parcelas replicadas para os meses futuros!`,
        });
      } else {
        toast({
          title: "Aviso",
          description: "Todas as parcelas já foram replicadas para os meses futuros.",
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

  const deleteInstallmentExpense = async (expenseId: string) => {
    try {
      const expense = await getExpenseById(expenseId);
      
      if (!expense.installment_current) {
        throw new Error('Dados de parcelamento inválidos');
      }

      // Se é uma despesa com parent_expense_id, usar o parent_id
      // Se não tem parent_expense_id, usar o próprio id como parent
      const parentId = expense.parent_expense_id || expense.id;
      
      // Excluir a parcela atual e todas as posteriores
      await deleteInstallmentExpensesFromCurrent(parentId, expense.installment_current);
      
      console.log(`Parcelas da despesa ${expense.title} excluídas a partir da parcela ${expense.installment_current}`);
      
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir despesa parcelada:', error);
      throw error;
    }
  };

  return {
    createInstallmentExpenses,
    replicateInstallmentExpenseToFuture,
    deleteInstallmentExpense,
  };
};
