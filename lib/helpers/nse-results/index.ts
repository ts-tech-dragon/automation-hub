export function formatNSEResultMessage(data: any) {
  const {
    company_name = "",
    symbol = "",
    meeting_date = "",
    highlights = "",
    financials = {},
    dividend_declared = "",
    dividend_amount = "",
    marketCap = "",
  } = data;

  let msg = `**🏢 ${company_name} (${symbol})**\n`;
  msg += `📅 **Date:** ${meeting_date}\n\n`;

  // 1. Highlights Section
  msg += `🔍 **Key Highlights:**\n`;
  highlights.forEach((h: string) => {
    msg += `• ${h}\n`;
  });

  // 2. Financials Section (Check if data exists)
  if (financials && financials.profit_current !== null) {
    msg += `\n📊 **Financial Performance:**\n`;
    msg += `💸 **Market Cap:** ₹${marketCap}\n`;
    msg += `💰 **Profit:** ₹${financials.profit_current} (YoY: ${financials.profit_yoy_chg_pct}%)\n`;
    msg += `📈 **EPS:** ${financials.eps_current} (YoY: ${financials.eps_yoy_chg_pct}%)\n`;
  } else {
    msg += `\n📊 *Financial results table not found in this filing.*\n`;
  }

  // 3. Dividend Section
  if (dividend_declared) {
    msg += `\n🤑 **Dividend:** ₹${dividend_amount} per share\n`;
  }

  return msg;
}

export const sortDataByMarketCap = (data: { marketCap?: string }[]) => {
  return data.sort((a, b) => {
    // Helper to convert string like "₹1,50,519 Cr" to a number
    const getNumericMCap = (item: { marketCap?: string }) => {
      if (!item.marketCap) return 0; // Move items without marketCap to the bottom

      // Remove Currency symbols, commas, and unit strings
      const numericString = item.marketCap.replace(/[₹,]|Cr/g, "").trim();

      return parseFloat(numericString);
    };

    // Sort descending: (b - a)
    return getNumericMCap(b) - getNumericMCap(a);
  });
};
