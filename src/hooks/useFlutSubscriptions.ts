import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FlutSubscription {
  id: string;
  client_name: string;
  monthly_value: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export const useFlutSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<FlutSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("flut_subscriptions")
        .select("*")
        .order("month_year", { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (error) {
      console.error("Erro ao buscar mensalidades:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensalidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (subscriptionData: Omit<FlutSubscription, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Criar mensalidades recorrentes - 12 meses a partir do mês especificado
      const startDate = new Date(subscriptionData.month_year);
      const subscriptions = [];
      
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const monthYearString = monthDate.toISOString().split('T')[0];
        
        subscriptions.push({
          ...subscriptionData,
          month_year: monthYearString
        });
      }

      const { data, error } = await supabase
        .from("flut_subscriptions")
        .insert(subscriptions)
        .select();

      if (error) throw error;

      // Atualizar estado local
      await fetchSubscriptions();
      toast({
        title: "Sucesso",
        description: "Mensalidades criadas com sucesso para 12 meses",
      });

      return data;
    } catch (error) {
      console.error("Erro ao criar mensalidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a mensalidade",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<FlutSubscription>) => {
    try {
      const { data, error } = await supabase
        .from("flut_subscriptions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSubscriptions(prev =>
        prev.map(sub => (sub.id === id ? data : sub))
      );

      toast({
        title: "Sucesso",
        description: "Mensalidade atualizada com sucesso",
      });

      return data;
    } catch (error) {
      console.error("Erro ao atualizar mensalidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mensalidade",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSubscription = async (clientName: string, startMonth: string) => {
    try {
      // Deletar todas as mensalidades do cliente a partir do mês especificado
      const { error } = await supabase
        .from("flut_subscriptions")
        .delete()
        .eq("client_name", clientName)
        .gte("month_year", startMonth);

      if (error) throw error;

      await fetchSubscriptions();
      toast({
        title: "Sucesso",
        description: "Mensalidades excluídas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir mensalidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensalidade",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions: fetchSubscriptions,
  };
};