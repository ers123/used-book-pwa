export type Provider = 'aladin' | 'yes24' | 'none';

export interface ProviderQuote {
  is_buyable: boolean;
  price: number;
  error?: string;
}

export interface BookQuote {
  isbn: string;
  title: string;
  aladin: ProviderQuote;
  yes24: ProviderQuote;
  recommendation: Provider;
  timestamp?: string;
}
