export interface IEarningsResult {
  symbol: string;
  company_name: string;
  meeting_date: Date;
  dividend_declared: boolean;
  dividend_amount: number;
  financials: {
    profit_current: number;
    eps_current: number;
    profit_qoq_chg_pct: number;
    profit_yoy_chg_pct: number;
    eps_qoq_chg_pct: number;
    eps_yoy_chg_pct: number;
  };
}

export interface IConcallEarningsResult {
  symbol: string;
  name: string;
  marketCap: string;
  eps: string;
}
