import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CashFlowEntry {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  title: string;
  description: string;
  date: string;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export const useCashFlow = () => {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async (monthYear: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cash_flow")
        .select("*")
        .eq("month_year", monthYear)
        .order("date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar lançamentos:", error);
        toast.error("Erro ao carregar lançamentos");
        return;
      }

      setEntries((data || []) as CashFlowEntry[]);
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error);
      toast.error("Erro ao carregar lançamentos");
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from("cash_flow")
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar lançamento:", error);
        toast.error("Erro ao adicionar lançamento");
        return;
      }

      setEntries(prev => [data as CashFlowEntry, ...prev]);
      toast.success("Lançamento adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      toast.error("Erro ao adicionar lançamento");
    }
  };

  const updateEntry = async (id: string, updates: Partial<CashFlowEntry>) => {
    try {
      const { data, error } = await supabase
        .from("cash_flow")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar lançamento:", error);
        toast.error("Erro ao atualizar lançamento");
        return;
      }

      setEntries(prev => prev.map(entry => 
        entry.id === id ? data as CashFlowEntry : entry
      ));
      toast.success("Lançamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar lançamento:", error);
      toast.error("Erro ao atualizar lançamento");
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cash_flow")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir lançamento:", error);
        toast.error("Erro ao excluir lançamento");
        return;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success("Lançamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      toast.error("Erro ao excluir lançamento");
    }
  };

  const getBalance = () => {
    const entradas = entries
      .filter(entry => entry.type === 'entrada')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
    const saidas = entries
      .filter(entry => entry.type === 'saida')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return entradas - saidas;
  };

  return {
    entries,
    loading,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getBalance
  };
};