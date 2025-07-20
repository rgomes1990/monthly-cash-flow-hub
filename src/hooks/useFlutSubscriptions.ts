import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FlutSubscription {
  id: string;
  client_name: string;
  monthly_value: number;
  month_year: string;
  paid: boolean;
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
      const { data, error } = await supabase
        .from("flut_subscriptions")
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;

      setSubscriptions(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Mensalidade criada com sucesso",
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

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from("flut_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Sucesso",
        description: "Mensalidade excluída com sucesso",
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