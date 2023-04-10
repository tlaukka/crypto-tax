export type Field = Record<string, number>
export type DataRow = Array<string | number | Date>
export type TransactionType = 'buy' | 'sell' | 'receive'
export type TransactionByAsset = Record<string, TransactionData>

export interface ParseResult {
  data?: any[],
  errors?: any[],
  meta?: any
}

export interface Transaction {
  asset: string,
  fees?: number,
  notes?: string,
  quantity: number,
  spotPrice: number,
  subtotal?: number,
  timestamp: Date,
  total?: number,
  transactionType: TransactionType
}

export interface TransactionData {
  buy?: Transaction[],
  sell?: Transaction[],
  receive?: Transaction[]
}


export interface DataTransformer {
  (results: ParseResult): TransactionByAsset
}
