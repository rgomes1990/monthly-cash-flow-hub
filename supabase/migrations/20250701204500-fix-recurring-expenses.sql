
-- Melhorar a função para criar despesas mensais automaticamente para todos os meses futuros
CREATE OR REPLACE FUNCTION create_monthly_expenses()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    expense_record RECORD;
    target_month_date DATE;
    existing_expense_count INTEGER;
    months_to_create INTEGER := 12; -- Criar despesas para os próximos 12 meses
    i INTEGER;
BEGIN
    -- Buscar todas as despesas mensais que são templates (parent_expense_id IS NULL)
    FOR expense_record IN 
        SELECT * FROM public.expenses 
        WHERE type = 'monthly' 
        AND parent_expense_id IS NULL
        AND is_recurring = TRUE
    LOOP
        -- Criar despesas para os próximos meses
        FOR i IN 1..months_to_create LOOP
            -- Calcular a data do mês alvo
            target_month_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' month')::INTERVAL;
            
            -- Se há um dia específico definido, usar esse dia
            IF expense_record.recurring_day IS NOT NULL THEN
                target_month_date := target_month_date + (expense_record.recurring_day - 1) * INTERVAL '1 day';
            END IF;
            
            -- Verificar se já existe uma despesa para este mês
            SELECT COUNT(*) INTO existing_expense_count
            FROM public.expenses
            WHERE parent_expense_id = expense_record.id
            AND DATE_TRUNC('month', date) = DATE_TRUNC('month', target_month_date);
            
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
                    target_month_date,
                    expense_record.description,
                    expense_record.id,
                    FALSE, -- Despesas filhas não são templates
                    NULL
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- Também criar uma função para processar despesas existentes que ainda não foram marcadas como recorrentes
CREATE OR REPLACE FUNCTION mark_existing_monthly_as_recurring()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Marcar todas as despesas mensais existentes como recorrentes se ainda não foram marcadas
    UPDATE public.expenses 
    SET is_recurring = TRUE
    WHERE type = 'monthly' 
    AND parent_expense_id IS NULL
    AND is_recurring IS NOT TRUE;
    
    -- Chamar a função para criar as despesas futuras
    PERFORM create_monthly_expenses();
END;
$$;
