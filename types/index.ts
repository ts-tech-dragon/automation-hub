export interface marketData {
  nifty: string;
  sensex: string;
  timestamp: string;
}

export interface JobDataResponse {
  company: string;
  title: string;
  location: string;
  link: string;
  source: string;
  mail?: string | null;
}
