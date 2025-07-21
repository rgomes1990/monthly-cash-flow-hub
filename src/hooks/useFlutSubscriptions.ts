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
      // Usar parsing manual da data para evitar problemas de timezone
      const dateStr = subscriptionData.month_year;
      const [year, month] = dateStr.split('-').map(Number);
      const startYear = year;
      const startMonth = month;
      const subscriptions = [];
      
      for (let i = 0; i < 12; i++) {
        const currentYear = startYear + Math.floor((startMonth - 1 + i) / 12);
        const currentMonth = ((startMonth - 1 + i) % 12) + 1;
        const monthYearString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
        
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

      // Atualizar lista imediatamente após inserção
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

      // Atualizar lista imediatamente após exclusão
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
    
    // Configurar real-time updates com nome único baseado em timestamp e random
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const channelName = `flut_subscriptions_${uniqueId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flut_subscriptions'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Atualizar a lista quando houver mudanças
          fetchSubscriptions();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to flut_subscriptions updates');
        }
      });

    // Cleanup function para remover o canal
    return () => {
      channel.unsubscribe();
    };
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