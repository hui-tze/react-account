import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRResponse} from "swr";
import {SalesTaxContext} from "@/apis/models/sales-lookup";
import {SalesPerson} from "@/apis/models/sales-person";
import {ShippingCompany} from "@/apis/models/shipping-company";

/** Taxes the branch is charged (else those of `taxGroupId`, e.g. a POS) plus item tax category exemptions. */
export function useGetSalesTaxContext(branchId: number | null | undefined, taxGroupId?: number | null): SWRResponse<SalesTaxContext> {
    const params = new URLSearchParams({...(branchId ? {branch_id: String(branchId)} : {}), ...(taxGroupId ? {tax_group_id: String(taxGroupId)} : {})});
    return useConsoleSwr(branchId || taxGroupId ? `/sales/lookups/tax-context?${params}` : null, authFetcher);
}

/** Selling price per item id for a sales type and currency (derived through sales type factors when not priced directly). */
export function useGetSalesPriceList(salesTypeId: number | null | undefined, currencyId: number | null | undefined): SWRResponse<Record<string, number>> {
    return useConsoleSwr(salesTypeId && currencyId ? `/sales/lookups/price-list?sales_type_id=${salesTypeId}&currency_id=${currencyId}` : null, authFetcher);
}

/** Rate on the document date: 1 for the home currency, null when a foreign currency has no rate yet. */
export function useGetExchangeRate(currencyId: number | null | undefined, date: string | null | undefined): SWRResponse<{rate: number | null}> {
    return useConsoleSwr(currencyId && date ? `/sales/lookups/exchange-rate?currency_id=${currencyId}&date=${date}` : null, authFetcher);
}

// dropdowns — every salesperson
export function useGetSalesPersonOptions(): SWRResponse<SalesPerson[]> {
    return useConsoleSwr("/sales-person", authFetcher);
}

// dropdowns — every shipping company
export function useGetShippingCompanyOptions(): SWRResponse<ShippingCompany[]> {
    return useConsoleSwr("/shipping-company", authFetcher);
}
