import { GoogleGenAI } from "@google/genai";
import { Transaction, Profile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  analyzeFinances: async (transactions: Transaction[], profiles: Profile[]) => {
    if (!process.env.API_KEY) {
      return "Chave de API não configurada. Por favor, configure a API Key para usar a IA.";
    }

    const dataSummary = {
      profiles: profiles.map(p => p.name),
      totalTransactions: transactions.length,
      summary: transactions.map(t => ({
        type: t.type,
        value: t.value,
        category: t.category,
        name: t.name,
        profile: profiles.find(p => p.id === t.profileId)?.name,
        priority: t.priority
      }))
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Atue como um consultor financeiro sênior. Analise os seguintes dados financeiros (em formato JSON) e forneça um relatório conciso em HTML (sem markdown, apenas tags como <p>, <strong>, <ul>, <li>).
        
        Foque em:
        1. Saúde financeira geral.
        2. Alertas sobre dívidas de alta prioridade.
        3. Oportunidades de corte de gastos.
        4. Sugestão para alocação de recursos.

        Dados: ${JSON.stringify(dataSummary)}`,
      });

      return response.text;
    } catch (error) {
      console.error("Erro ao consultar Gemini:", error);
      return "Não foi possível gerar a análise no momento.";
    }
  }
};