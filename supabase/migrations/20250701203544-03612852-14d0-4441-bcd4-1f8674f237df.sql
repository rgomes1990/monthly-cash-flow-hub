
-- Adicionar campos para controlar despesas recorrentes
ALTER TABLE public.expenses 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN parent_expense_id UUID REFERENCES public.expenses(id),
ADD COLUMN recurring_day INTEGER;

-- Índice para melhorar performance nas consultas de despesas recorrentes
CREATE INDEX idx_expenses_recurring ON public.expenses(parent_expense_id, is_recurring) WHERE is_recurring = TRUE;

-- Função para criar despesas mensais automaticamente
CREATE OR REPLACE FUNCTION create_monthly_expenses()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    expense_record RECORD;
    next_month_date DATE;
    existing_expense_count INTEGER;
BEGIN
    -- Buscar todas as despesas mensais que são templates (parent_expense_id IS NULL)
    FOR expense_record IN 
        SELECT * FROM public.expenses 
        WHERE type = 'monthly' 
        AND parent_expense_id IS NULL
        AND is_recurring = TRUE
    LOOP
        -- Calcular a data do próximo mês
        next_month_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
        
        -- Se há um dia específico definido, usar esse dia
        IF expense_record.recurring_day IS NOT NULL THEN
            next_month_date := next_month_date + (expense_record.recurring_day - 1) * INTERVAL '1 day';
        END IF;
        
        -- Verificar se já existe uma despesa para este mês
        SELECT COUNT(*) INTO existing_expense_count
        FROM public.expenses
        WHERE parent_expense_id = expense_record.id
        AND DATE_TRUNC('month', date) = DATE_TRUNC('month', next_month_date);
        
        -- Se não existe, criar a nova despesa
        IF existing_expense_count = 0 THEN
            INSERT INTO public.expenses (
                title, amount, category, type, expense_category, 
                date, description, parent_expense_id, is_recurring, recurring_day
            )
            VALUES (
                expense_record.title,
                expense_record.amount,
                expense_record.category,
                expense_record.type,
                expense_record.expense_category,
                next_month_date,
                expense_record.description,
                expense_record.id,
                FALSE, -- Despesas filhas não são templates
                NULL
            );
        END IF;
    END LOOP;
END;
$$;
