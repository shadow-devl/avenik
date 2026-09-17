import { prisma } from '../../db.js';
import { ai } from '../../lib/gemini.js';

export class PredictiveFinanceService {
  /**
   * Analyzes financial records to forecast cash runway, burn rate, and revenue trajectory.
   */
  static async forecastRunway(businessId: string, horizonMonths: number = 12) {
    // 1. Fetch the last 100 financial records for trajectory analysis
    const financials = await prisma.financialRecord.findMany({
      where: { businessId },
      orderBy: { transactionDate: 'desc' },
      take: 200
    });

    if (financials.length === 0) {
      throw new Error("Insufficient financial data to generate a forecast.");
    }

    // 2. Aggregate basic baseline metrics to ground the AI
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalRevenue = 0;
    let totalExpense = 0;

    const currentMonth = new Date().getMonth();
    let currentMonthBurn = 0;
    let currentMonthRevenue = 0;

    financials.forEach(f => {
      const isCurrentMonth = f.transactionDate.getMonth() === currentMonth;
      if (f.type === 'INFLOW') {
        totalInflow += f.amount;
        if (f.category === 'REVENUE') totalRevenue += f.amount;
        if (isCurrentMonth && f.category === 'REVENUE') currentMonthRevenue += f.amount;
      } else if (f.type === 'OUTFLOW') {
        totalOutflow += f.amount;
        if (f.category === 'EXPENSE') totalExpense += f.amount;
        if (isCurrentMonth) currentMonthBurn += f.amount;
      }
    });

    const currentCashBalance = Math.max(0, totalInflow - totalOutflow);

    // 3. Construct AI Prompt Payload
    const contextStr = JSON.stringify({
      baseline: {
        currentCashBalance,
        totalHistoricalRevenue: totalRevenue,
        totalHistoricalExpense: totalExpense,
        currentMonthBurn,
        currentMonthRevenue
      },
      forecastHorizonMonths: horizonMonths,
      recentTransactionsSample: financials.slice(0, 20).map(f => ({
        date: f.transactionDate.toISOString().split('T')[0],
        type: f.type,
        category: f.category,
        amount: f.amount
      }))
    });

    const prompt = `
You are AVENIK's Predictive Financial AI.
Analyze the following financial telemetry for a business and predict their cash runway and financial trajectory for the next ${horizonMonths} months.

Business Financial Context:
${contextStr}

Respond EXACTLY with a JSON object in this format:
{
  "summary": "2-3 sentences explaining the financial health and runway trajectory.",
  "currentCash": number,
  "averageMonthlyBurn": number,
  "projectedRunwayMonths": number (float, e.g., 5.5, or 999 if profitable/infinite),
  "cashOutDate": "YYYY-MM-DD" (or null if infinite),
  "revenueForecast": [
    { "month": "YYYY-MM", "projectedRevenue": number, "projectedExpense": number }
  ] (Return exactly ${horizonMonths} elements for the next ${horizonMonths} months),
  "financialRisks": [
    "String describing a specific cash-flow risk, high expense area, or revenue stagnation."
  ]
}
`.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from AI");

      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Financial Forecast Failed:", error);
      throw error;
    }
  }
}
