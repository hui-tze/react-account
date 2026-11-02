import {Currency} from "@/apis/models/currency";

export type ExchangeRate = {
    id: number,
    company_id: number,
    currency_id: number,
    rate_date: string,
    rate: string,
    status: string,
    currency?: Currency,
}
