
import { GoogleGenAI } from "@google/genai";
import { Transaction, InventoryItem, Debt } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBusinessInsights = async (
  transactions: Transaction[],
  inventory: InventoryItem[],
  debts: Debt[]
): Promise<string> => {
  if (!process.env.API_KEY) return "AI insights are unavailable without an API key.";

  const summary = {
    totalSales: transactions.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    inventoryCount: inventory.length,
    totalDebt: debts.reduce((sum, d) => sum + d.amount, 0),
    recentActivities: transactions.slice(-5).map(t => `${t.type}: ${t.description} ($${t.amount})`)
  };

  const prompt = `
    As a business consultant for a small retail shop, analyze the following data:
    Summary: ${JSON.stringify(summary)}
    Inventory Status: ${inventory.map(i => `${i.name} (${i.quantity} left)`).join(', ')}
    
    Provide a concise (2-3 sentences) business advice for Sarah, the shop owner. 
    Be encouraging and highlight one specific area of improvement based on the data.
    Don't use markdown headers, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to fetch business insights. Please try again later.";
  }
};
