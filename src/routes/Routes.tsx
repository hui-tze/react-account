import {ComponentType} from "react";
import {createBrowserRouter, createRoutesFromElements, Navigate, Route} from "react-router-dom";

// Layout

import ModuleLayout from "@/layout/Module/ModuleLayout";

// Views

import Dashboard from "@/views/Dashboard";
import SearchPage from "@/views/Search/SearchPage";
import Nav from "./Nav";
import SettingsHome from "@/views/Settings";
import CreateLink from "@/views/Settings/shared/CreateLink";

// Settings — Organization
import Profile from "@/views/Settings/Organization/Profile";
import DisplayPreference from "@/views/Settings/Organization/DisplayPreference";
import SystemSetup from "@/views/Settings/Organization/SystemSetup";
import DocumentNumberings from "@/views/Settings/Organization/DocumentNumbering";
import CreateDocumentNumbering from "@/views/Settings/Organization/DocumentNumbering/Create";
import EditDocumentNumbering from "@/views/Settings/Organization/DocumentNumbering/[id]";

// Settings — Sales
import ContactCategories from "@/views/Settings/Sales/ContactCategories";
import CreateContactCategory from "@/views/Settings/Sales/ContactCategories/Create";
import EditContactCategory from "@/views/Settings/Sales/ContactCategories/[id]";
import SalesGroups from "@/views/Settings/Sales/SalesGroups";
import CreateSalesGroup from "@/views/Settings/Sales/SalesGroups/Create";
import EditSalesGroup from "@/views/Settings/Sales/SalesGroups/[id]";
import SalesTypes from "@/views/Settings/Sales/SalesTypes";
import CreateSalesType from "@/views/Settings/Sales/SalesTypes/Create";
import EditSalesType from "@/views/Settings/Sales/SalesTypes/[id]";
import SalesAreas from "@/views/Settings/Sales/SalesAreas";
import CreateSalesArea from "@/views/Settings/Sales/SalesAreas/Create";
import EditSalesArea from "@/views/Settings/Sales/SalesAreas/[id]";
import CreditStatuses from "@/views/Settings/Sales/CreditStatuses";
import CreateCreditStatus from "@/views/Settings/Sales/CreditStatuses/Create";
import EditCreditStatus from "@/views/Settings/Sales/CreditStatuses/[id]";
import PaymentTerms from "@/views/Settings/Sales/PaymentTerms";
import CreatePaymentTerm from "@/views/Settings/Sales/PaymentTerms/Create";
import EditPaymentTerm from "@/views/Settings/Sales/PaymentTerms/[id]";
import PosSettings from "@/views/Settings/Sales/PosSettings";
import CreatePosSetting from "@/views/Settings/Sales/PosSettings/Create";
import EditPosSetting from "@/views/Settings/Sales/PosSettings/[id]";

// Settings — Inventory
import ItemCategories from "@/views/Settings/Inventory/ItemCategories";
import CreateItemCategory from "@/views/Settings/Inventory/ItemCategories/Create";
import EditItemCategory from "@/views/Settings/Inventory/ItemCategories/[id]";
import InventoryLocations from "@/views/Settings/Inventory/InventoryLocations";
import CreateInventoryLocation from "@/views/Settings/Inventory/InventoryLocations/Create";
import EditInventoryLocation from "@/views/Settings/Inventory/InventoryLocations/[id]";
import UnitsOfMeasurement from "@/views/Settings/Inventory/UnitsOfMeasurement";
import CreateUom from "@/views/Settings/Inventory/UnitsOfMeasurement/Create";
import EditUom from "@/views/Settings/Inventory/UnitsOfMeasurement/[id]";

// Settings — Banking
import BankAccounts from "@/views/Settings/Banking/BankAccounts";
import CreateBankAccount from "@/views/Settings/Banking/BankAccounts/Create";
import EditBankAccount from "@/views/Settings/Banking/BankAccounts/[id]";

// Settings — General Ledger
import ChartOfAccounts from "@/views/Settings/GL/ChartOfAccounts";
import ChartOfAccountsHeaderOptions from "@/views/Settings/GL/ChartOfAccounts/ChartOfAccountsHeaderOptions";
import {NewAccountTriggerProvider} from "@/views/Settings/GL/ChartOfAccounts/NewAccountTrigger";
import FiscalYears from "@/views/Settings/GL/FiscalYears";
import FiscalYearHeaderOptions from "@/views/Settings/GL/FiscalYears/FiscalYearHeaderOptions";
import CreateFiscalYear from "@/views/Settings/GL/FiscalYears/Create";
import EditFiscalYear from "@/views/Settings/GL/FiscalYears/[id]";
import Currencies from "@/views/Settings/GL/Currencies";
import CurrencyHeaderOptions from "@/views/Settings/GL/Currencies/CurrencyHeaderOptions";
import CreateCurrency from "@/views/Settings/GL/Currencies/Create";
import EditCurrency from "@/views/Settings/GL/Currencies/[id]";
import ExchangeRates from "@/views/Settings/GL/ExchangeRates";
import ExchangeRateHeaderOptions from "@/views/Settings/GL/ExchangeRates/ExchangeRateHeaderOptions";
import CreateExchangeRate from "@/views/Settings/GL/ExchangeRates/Create";
import EditExchangeRate from "@/views/Settings/GL/ExchangeRates/[id]";

// Settings — Taxes
import TaxTypes from "@/views/Settings/Taxes/TaxTypes";
import CreateTaxType from "@/views/Settings/Taxes/TaxTypes/Create";
import EditTaxType from "@/views/Settings/Taxes/TaxTypes/[id]";
import TaxGroups from "@/views/Settings/Taxes/TaxGroups";
import CreateTaxGroup from "@/views/Settings/Taxes/TaxGroups/Create";
import EditTaxGroup from "@/views/Settings/Taxes/TaxGroups/[id]";
import ItemTaxTypes from "@/views/Settings/Taxes/ItemTaxTypes";
import CreateItemTaxType from "@/views/Settings/Taxes/ItemTaxTypes/Create";
import EditItemTaxType from "@/views/Settings/Taxes/ItemTaxTypes/[id]";

// Item & Inventory
import Items from "@/views/Inventory/Items";
import CreateItem from "@/views/Inventory/Items/Create";
import EditItem from "@/views/Inventory/Items/[id]";
import ItemMovements from "@/views/Inventory/ItemMovements";
import ViewItemMovement from "@/views/Inventory/ItemMovements/[id]";
import Adjustments from "@/views/Inventory/Adjustments";
import CreateAdjustment from "@/views/Inventory/Adjustments/Create";
import EditAdjustment from "@/views/Inventory/Adjustments/[id]";
import Transfers from "@/views/Inventory/Transfers";
import CreateTransfer from "@/views/Inventory/Transfers/Create";
import EditTransfer from "@/views/Inventory/Transfers/[id]";
import SalesPricing from "@/views/Inventory/SalesPricing";
import CreateSalesPrice from "@/views/Inventory/SalesPricing/Create";
import EditSalesPrice from "@/views/Inventory/SalesPricing/[id]";
import PurchasingPricing from "@/views/Inventory/PurchasingPricing";
import CreatePurchasePrice from "@/views/Inventory/PurchasingPricing/Create";
import EditPurchasePrice from "@/views/Inventory/PurchasingPricing/[id]";
import StandardCosts from "@/views/Inventory/StandardCosts";
import EditStandardCost from "@/views/Inventory/StandardCosts/[id]";
import {ADJUSTMENTS_PATH, ITEMS_PATH, PURCHASING_PRICING_PATH, SALES_PRICING_PATH, TRANSFERS_PATH} from "@/views/Inventory/inventory-menu";

// Sales
import Customers from "@/views/Sales/Customers";
import {CreateCustomer, EditCustomer} from "@/views/Sales/Customers/CustomerPages";
import {CreateBranch, EditBranch} from "@/views/Sales/Customers/Branches/BranchPage";
import {Quotations, SalesOrders} from "@/views/Sales/Orders/OrderListPages";
import {CreateQuotation, CreateSalesOrder, EditQuotation, EditSalesOrder} from "@/views/Sales/Orders/OrderPages";
import {CreateDelivery, DeliveryNotes, EditDelivery} from "@/views/Sales/Deliveries/DeliveryPages";
import {CreateInvoice, EditInvoice, Invoices} from "@/views/Sales/Invoices/InvoicePages";
import {CreateCreditNote, CreditNotes, ViewCreditNote} from "@/views/Sales/CreditNotes/CreditNotePages";
import {CreatePosCreditNote, CreatePosReceipt, PosCreditNotes, PosReceipts, ViewPosCreditNote, ViewPosReceipt} from "@/views/Sales/Pos/PosPages";
import {ConsolidationPage} from "@/views/Einvoice/Consolidation/ConsolidationPage";
import {PendingConsolidationPage} from "@/views/Einvoice/Consolidation/PendingConsolidationPage";
import {CreatePayment, EditPayment, Payments} from "@/views/Sales/Payments/PaymentPages";
import {CREDIT_NOTES_PATH, CUSTOMERS_PATH, DELIVERIES_PATH, INVOICES_PATH, ORDERS_PATH, PAYMENTS_PATH, POS_RECEIPTS_PATH, QUOTATIONS_PATH} from "@/views/Sales/sales-menu";

// Purchases
import {CreateSupplier, EditSupplier, Suppliers} from "@/views/Purchases/Suppliers/SupplierPages";
import {CreatePurchaseOrder, EditPurchaseOrder, PurchaseOrders} from "@/views/Purchases/Orders/PurchaseOrderPages";
import {CreateGoodsReceipt, EditGoodsReceipt, GoodsReceipts} from "@/views/Purchases/Receipts/ReceiptPages";
import {Bills, CreateSelfBilledInvoice, CreateSupplierBill, EditSelfBilledInvoice, EditSupplierBill, SelfBilledInvoices} from "@/views/Purchases/Bills/BillPages";
import {
    CreateSelfBilledCreditNote, CreateSupplierCreditNote, SelfBilledCreditNotes, SupplierCreditNotes, ViewSelfBilledCreditNote, ViewSupplierCreditNote,
} from "@/views/Purchases/CreditNotes/SupplierCreditNotePages";
import {CreateSupplierPayment, EditSupplierPayment, SupplierPayments} from "@/views/Purchases/Payments/SupplierPaymentPages";
import SupplierAllocationPage from "@/views/Purchases/Allocation/SupplierAllocationPage";

// Banking
import {BankAccountRegister, BankAccounts as BankingAccounts} from "@/views/Banking/Accounts/BankAccountPages";
import {BankTransactions, CreateBankDeposit, CreateBankPayment, CreateBankTransfer, ViewBankDocument} from "@/views/Banking/Documents/BankDocumentPages";
import {Reconciliation} from "@/views/Banking/Reconciliation/ReconciliationPage";
import {BANK_PAYMENT_CREATE_PATH} from "@/views/Banking/banking-menu";

// General Ledger
import {LedgerEntries} from "@/views/GeneralLedger/Ledger/LedgerEntries";
import {CreateJournal, Journals, ViewJournal} from "@/views/GeneralLedger/Journals/JournalPages";
import {TaxReport} from "@/views/GeneralLedger/Taxes/TaxReport";
import {BalanceSheet, GlChartOfAccounts, ProfitAndLoss, TrialBalance} from "@/views/GeneralLedger/Reports/ReportPages";
import {GL_JOURNALS_PATH} from "@/views/GeneralLedger/gl-menu";
import {DimensionDetail, DimensionList} from "@/views/Dimensions/Dimensions/DimensionPages";
import {DefaultsPage} from "@/views/Dimensions/Defaults/DefaultsPage";
import {BudgetList, CreateBudget, EditBudget} from "@/views/Dimensions/Budgets/BudgetPages";
import {BudgetVsActual, DimensionProfitLoss} from "@/views/Dimensions/Reports/DimensionReports";
import {BUDGETS_PATH} from "@/views/Dimensions/dimensions-menu";
import {CreateRole, EditRole, Roles} from "@/views/Settings/Organization/Access/RolePages";
import {Users} from "@/views/Settings/Organization/Access/UsersPage";

// E-Invoice (LHDN MyInvois)
import EinvoiceSettings from "@/views/Settings/Organization/Einvoice";
import {EinvoiceDocuments, OutstandingEinvoices, ViewEinvoiceDocument} from "@/views/Einvoice/Documents/EinvoiceDocumentPages";
import {
    BILLS_PATH, PURCHASE_ORDERS_PATH, RECEIPTS_PATH, SELF_BILLED_CREDIT_NOTES_PATH, SELF_BILLED_PATH, SUPPLIER_CREDIT_NOTES_PATH, SUPPLIER_PAYMENTS_PATH, SUPPLIERS_PATH,
} from "@/views/Purchases/purchases-menu";

type CrudRouteOptions = {
    // path segment under the module, e.g. "sales-areas"
    path: string,
    // full URL of the listing, used by the header "New" button
    basePath: string,
    title: string,
    // translation key of the header "New …" button
    newLabelKey: string,
    List: ComponentType,
    Create: ComponentType,
    Edit: ComponentType,
};

// listing + create + edit routes for one settings entity (a plain function, so
// createRoutesFromElements still sees <Route> elements)
function crudRoutes({path, basePath, title, newLabelKey, List, Create, Edit}: CrudRouteOptions) {
    return (
        <Route path={path} handle={{title, canNavigate: true}}>
            <Route index element={<List />} handle={{hide: true, headerOptions: <CreateLink to={`${basePath}/create`} labelKey={newLabelKey} />}} />
            <Route path="create" element={<Create />} handle={{title: "Create", canNavigate: false}} />
            <Route path=":id" element={<Edit />} handle={{title: "Edit", canNavigate: false}} />
        </Route>
    );
}

/** Setup screens of the Sales module, mounted under the module and under Settings at `base`. */
function salesSetupRoutes(base: string) {
    return (
        <>
            <Route index element={<Navigate to="contact-categories" replace />} />
            {crudRoutes({path: "contact-categories", basePath: `${base}/contact-categories`, title: "Contact Categories", newLabelKey: "newContactCategory", List: ContactCategories, Create: CreateContactCategory, Edit: EditContactCategory})}
            {crudRoutes({path: "sales-groups", basePath: `${base}/sales-groups`, title: "Sales Groups", newLabelKey: "newSalesGroup", List: SalesGroups, Create: CreateSalesGroup, Edit: EditSalesGroup})}
            {crudRoutes({path: "sales-types", basePath: `${base}/sales-types`, title: "Sales Type", newLabelKey: "newSalesType", List: SalesTypes, Create: CreateSalesType, Edit: EditSalesType})}
            {crudRoutes({path: "sales-areas", basePath: `${base}/sales-areas`, title: "Sales Areas", newLabelKey: "newSalesArea", List: SalesAreas, Create: CreateSalesArea, Edit: EditSalesArea})}
            {crudRoutes({path: "credit-statuses", basePath: `${base}/credit-statuses`, title: "Credit Status", newLabelKey: "newCreditStatus", List: CreditStatuses, Create: CreateCreditStatus, Edit: EditCreditStatus})}
            {crudRoutes({path: "payment-terms", basePath: `${base}/payment-terms`, title: "Payment Terms", newLabelKey: "newPaymentTerm", List: PaymentTerms, Create: CreatePaymentTerm, Edit: EditPaymentTerm})}
            {crudRoutes({path: "pos-settings", basePath: `${base}/pos-settings`, title: "POS Settings", newLabelKey: "newPosSetting", List: PosSettings, Create: CreatePosSetting, Edit: EditPosSetting})}
        </>
    );
}

/** Setup screens of the Inventory module, mounted under the module and under Settings at `base`. */
function inventorySetupRoutes(base: string) {
    return (
        <>
            <Route index element={<Navigate to="item-categories" replace />} />
            {crudRoutes({path: "item-categories", basePath: `${base}/item-categories`, title: "Item Categories", newLabelKey: "newItemCategory", List: ItemCategories, Create: CreateItemCategory, Edit: EditItemCategory})}
            {crudRoutes({path: "inventory-locations", basePath: `${base}/inventory-locations`, title: "Inventory Locations", newLabelKey: "newInventoryLocation", List: InventoryLocations, Create: CreateInventoryLocation, Edit: EditInventoryLocation})}
            {crudRoutes({path: "units-of-measurement", basePath: `${base}/units-of-measurement`, title: "Unit of Measurement", newLabelKey: "newUnitOfMeasurement", List: UnitsOfMeasurement, Create: CreateUom, Edit: EditUom})}
        </>
    );
}

/** Setup screens of the Banking module, mounted under the module and under Settings at `base`. */
function bankingSetupRoutes(base: string) {
    return (
        <>
            <Route index element={<Navigate to="bank-accounts" replace />} />
            {crudRoutes({path: "bank-accounts", basePath: `${base}/bank-accounts`, title: "Bank Account", newLabelKey: "newBankAccount", List: BankAccounts, Create: CreateBankAccount, Edit: EditBankAccount})}
        </>
    );
}

/** Setup screens of the General Ledger module, mounted under the module and under Settings at `base`. */
function glSetupRoutes(base: string) {
    return (
        <>
            <Route index element={<Navigate to="chart-of-accounts" replace />} />
            <Route path="chart-of-accounts" element={<ChartOfAccounts />} handle={{title: "Chart of Accounts", canNavigate: true, headerOptions: <ChartOfAccountsHeaderOptions/>}} />

            <Route path="fiscal-years" handle={{title: "Fiscal Years", canNavigate: true}}>
                <Route index element={<FiscalYears />} handle={{hide: true, headerOptions: <FiscalYearHeaderOptions/>}} />
                <Route path="create" element={<CreateFiscalYear />} handle={{title: "Create", canNavigate: false}} />
                <Route path=":id" element={<EditFiscalYear />} handle={{title: "Edit", canNavigate: false}} />
            </Route>

            <Route path="currencies" handle={{title: "Currencies", canNavigate: true}}>
                <Route index element={<Currencies />} handle={{hide: true, headerOptions: <CurrencyHeaderOptions/>}} />
                <Route path="create" element={<CreateCurrency />} handle={{title: "Create", canNavigate: false}} />
                <Route path=":id" element={<EditCurrency />} handle={{title: "Edit", canNavigate: false}} />
            </Route>

            <Route path="exchange-rates" handle={{title: "Exchange Rates", canNavigate: true}}>
                <Route index element={<ExchangeRates />} handle={{hide: true, headerOptions: <ExchangeRateHeaderOptions/>}} />
                <Route path="create" element={<CreateExchangeRate />} handle={{title: "Create", canNavigate: false}} />
                <Route path=":id" element={<EditExchangeRate />} handle={{title: "Edit", canNavigate: false}} />
            </Route>
        </>
    );
}

export const mainRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Nav />} handle={{hide: true}} >
            <Route index path="/dashboard" element={<Dashboard />} handle={{title: "dashboard", hide: false, canNavigate: true}} />
            <Route path="/search" element={<SearchPage />} handle={{title: "Search", canNavigate: false}} />

            <Route path="/sales" element={<ModuleLayout />} handle={{title: "Sales", module: "sales", canNavigate: true}} >
                <Route index element={<Navigate to="quotations" replace />} />
                {crudRoutes({path: "quotations", basePath: QUOTATIONS_PATH, title: "Quotations", newLabelKey: "newQuotation", List: Quotations, Create: CreateQuotation, Edit: EditQuotation})}
                {crudRoutes({path: "orders", basePath: ORDERS_PATH, title: "Sales Orders", newLabelKey: "newSalesOrder", List: SalesOrders, Create: CreateSalesOrder, Edit: EditSalesOrder})}
                {crudRoutes({path: "deliveries", basePath: DELIVERIES_PATH, title: "Delivery Notes", newLabelKey: "newDeliveryNote", List: DeliveryNotes, Create: CreateDelivery, Edit: EditDelivery})}
                {crudRoutes({path: "invoices", basePath: INVOICES_PATH, title: "Invoices", newLabelKey: "newInvoice", List: Invoices, Create: CreateInvoice, Edit: EditInvoice})}
                {/* credit notes are voided rather than edited, so a saved one opens as a view */}
                <Route path="credit-notes" handle={{title: "Credit Notes", canNavigate: true}}>
                    <Route index element={<CreditNotes />} handle={{hide: true, headerOptions: <CreateLink to={`${CREDIT_NOTES_PATH}/create`} labelKey="newCreditNote" />}} />
                    <Route path="create" element={<CreateCreditNote />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewCreditNote />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="pos-receipts" handle={{title: "POS Receipts", canNavigate: true}}>
                    <Route index element={<PosReceipts />} handle={{hide: true, headerOptions: <CreateLink to={`${POS_RECEIPTS_PATH}/create`} labelKey="posNewReceipt" />}} />
                    <Route path="create" element={<CreatePosReceipt />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewPosReceipt />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="pos-credit-notes" handle={{title: "POS Credit Notes", canNavigate: true}}>
                    <Route index element={<PosCreditNotes />} handle={{hide: true}} />
                    <Route path="create" element={<CreatePosCreditNote />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewPosCreditNote />} handle={{title: "View", canNavigate: false}} />
                </Route>
                {crudRoutes({path: "payments", basePath: PAYMENTS_PATH, title: "Customer Payments", newLabelKey: "newPayment", List: Payments, Create: CreatePayment, Edit: EditPayment})}
                <Route path="customers" handle={{title: "Customers", canNavigate: true}}>
                    <Route index element={<Customers />} handle={{hide: true, headerOptions: <CreateLink to={`${CUSTOMERS_PATH}/create`} labelKey="newCustomer" />}} />
                    <Route path="create" element={<CreateCustomer />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<EditCustomer />} handle={{title: "Edit", canNavigate: false}} />
                    {/* siblings, not children, so the branch's :id doesn't shadow the customer's */}
                    <Route path=":customerId/branches/create" element={<CreateBranch />} handle={{title: "New Branch", canNavigate: false}} />
                    <Route path=":customerId/branches/:id" element={<EditBranch />} handle={{title: "Branch", canNavigate: false}} />
                </Route>

                <Route path="setup" handle={{title: "Setup", canNavigate: false}}>
                    {salesSetupRoutes("/sales/setup")}
                </Route>
            </Route>

            <Route path="/purchases" element={<ModuleLayout />} handle={{title: "Purchases", module: "purchases", canNavigate: true}} >
                <Route index element={<Navigate to="orders" replace />} />
                {crudRoutes({path: "orders", basePath: PURCHASE_ORDERS_PATH, title: "Purchase Orders", newLabelKey: "newPurchaseOrder", List: PurchaseOrders, Create: CreatePurchaseOrder, Edit: EditPurchaseOrder})}
                {crudRoutes({path: "receipts", basePath: RECEIPTS_PATH, title: "Goods Receipts", newLabelKey: "newGoodsReceipt", List: GoodsReceipts, Create: CreateGoodsReceipt, Edit: EditGoodsReceipt})}
                {crudRoutes({path: "bills", basePath: BILLS_PATH, title: "Bills", newLabelKey: "newBill", List: Bills, Create: CreateSupplierBill, Edit: EditSupplierBill})}
                {crudRoutes({path: "self-billed-invoices", basePath: SELF_BILLED_PATH, title: "Self-billed Invoices", newLabelKey: "newSelfBilledInvoice", List: SelfBilledInvoices, Create: CreateSelfBilledInvoice, Edit: EditSelfBilledInvoice})}
                {crudRoutes({path: "payments", basePath: SUPPLIER_PAYMENTS_PATH, title: "Supplier Payments", newLabelKey: "newSupplierPayment", List: SupplierPayments, Create: CreateSupplierPayment, Edit: EditSupplierPayment})}
                {/* credit notes are voided rather than edited, so a saved one opens as a view */}
                <Route path="credit-notes" handle={{title: "Credit Notes", canNavigate: true}}>
                    <Route index element={<SupplierCreditNotes />} handle={{hide: true, headerOptions: <CreateLink to={`${SUPPLIER_CREDIT_NOTES_PATH}/create`} labelKey="newCreditNote" />}} />
                    <Route path="create" element={<CreateSupplierCreditNote />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewSupplierCreditNote />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="self-billed-credit-notes" handle={{title: "Self-billed Credit Notes", canNavigate: true}}>
                    <Route index element={<SelfBilledCreditNotes />} handle={{hide: true, headerOptions: <CreateLink to={`${SELF_BILLED_CREDIT_NOTES_PATH}/create`} labelKey="newCreditNote" />}} />
                    <Route path="create" element={<CreateSelfBilledCreditNote />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewSelfBilledCreditNote />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="allocation" element={<SupplierAllocationPage />} handle={{title: "Supplier Allocation", canNavigate: true}} />
                {crudRoutes({path: "suppliers", basePath: SUPPLIERS_PATH, title: "Suppliers", newLabelKey: "newSupplier", List: Suppliers, Create: CreateSupplier, Edit: EditSupplier})}
            </Route>

            <Route path="/banking" element={<ModuleLayout />} handle={{title: "Banking", module: "banking", canNavigate: true}} >
                <Route index element={<Navigate to="accounts" replace />} />
                <Route path="accounts" handle={{title: "All Bank Accounts", canNavigate: true}}>
                    <Route index element={<BankingAccounts />} handle={{hide: true}} />
                    <Route path=":id" element={<BankAccountRegister />} handle={{title: "Register", canNavigate: false}} />
                </Route>
                <Route path="transactions" handle={{title: "Bank Transactions", canNavigate: true}}>
                    <Route index element={<BankTransactions />} handle={{hide: true, headerOptions: <CreateLink to={BANK_PAYMENT_CREATE_PATH} labelKey="newBankPayment" />}} />
                    <Route path=":id" element={<ViewBankDocument />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="payments/create" element={<CreateBankPayment />} handle={{title: "Payment", canNavigate: false}} />
                <Route path="deposits/create" element={<CreateBankDeposit />} handle={{title: "Deposit", canNavigate: false}} />
                <Route path="transfers/create" element={<CreateBankTransfer />} handle={{title: "Bank Account Transfer", canNavigate: false}} />
                <Route path="reconciliation" element={<Reconciliation />} handle={{title: "Reconciliation", canNavigate: true}} />

                <Route path="setup" handle={{title: "Setup", canNavigate: false}}>
                    {bankingSetupRoutes("/banking/setup")}
                </Route>
            </Route>

            <Route path="/gl" element={<NewAccountTriggerProvider><ModuleLayout /></NewAccountTriggerProvider>} handle={{title: "General Ledger", module: "gl", canNavigate: true}} >
                <Route index element={<Navigate to="entries" replace />} />
                <Route path="entries" element={<LedgerEntries />} handle={{title: "All General Ledger", canNavigate: true}} />
                <Route path="journals" handle={{title: "All Journals", canNavigate: true}}>
                    <Route index element={<Journals />} handle={{hide: true, headerOptions: <CreateLink to={`${GL_JOURNALS_PATH}/create`} labelKey="newJournal" />}} />
                    <Route path="create" element={<CreateJournal />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<ViewJournal />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="taxes" element={<TaxReport />} handle={{title: "All Taxes", canNavigate: true}} />
                <Route path="chart-of-accounts" element={<GlChartOfAccounts />} handle={{title: "Chart Of Account", canNavigate: true}} />
                <Route path="profit-loss" element={<ProfitAndLoss />} handle={{title: "Profit & Loss", canNavigate: true}} />
                <Route path="balance-sheet" element={<BalanceSheet />} handle={{title: "Balance Sheet", canNavigate: true}} />
                <Route path="trial-balance" element={<TrialBalance />} handle={{title: "Trial Balance", canNavigate: true}} />

                <Route path="setup" handle={{title: "Setup", canNavigate: false}}>
                    {glSetupRoutes("/gl/setup")}
                </Route>
            </Route>

            <Route path="/dimensions" element={<ModuleLayout />} handle={{title: "Budgeting & Cost Centres", module: "dimensions", canNavigate: true}} >
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" handle={{title: "All Dimensions", canNavigate: true}}>
                    <Route index element={<DimensionList />} handle={{hide: true}} />
                    <Route path=":id" element={<DimensionDetail />} handle={{title: "Values", canNavigate: false}} />
                </Route>
                <Route path="defaults" element={<DefaultsPage />} handle={{title: "Default Values", canNavigate: true}} />
                <Route path="budgets" handle={{title: "Budgets", canNavigate: true}}>
                    <Route index element={<BudgetList />} handle={{hide: true, headerOptions: <CreateLink to={`${BUDGETS_PATH}/create`} labelKey="newBudget" />}} />
                    <Route path="create" element={<CreateBudget />} handle={{title: "Create", canNavigate: false}} />
                    <Route path=":id" element={<EditBudget />} handle={{title: "Edit", canNavigate: false}} />
                </Route>
                <Route path="budget-vs-actual" element={<BudgetVsActual />} handle={{title: "Budget vs Actual", canNavigate: true}} />
                <Route path="profit-loss" element={<DimensionProfitLoss />} handle={{title: "Profit & Loss by Dimension", canNavigate: true}} />
            </Route>

            <Route path="/einvoice" element={<ModuleLayout />} handle={{title: "E-Invoice", module: "einvoice", canNavigate: true}} >
                <Route index element={<Navigate to="documents" replace />} />
                <Route path="documents" handle={{title: "Submitted Documents", canNavigate: true}}>
                    <Route index element={<EinvoiceDocuments />} handle={{hide: true}} />
                    <Route path=":id" element={<ViewEinvoiceDocument />} handle={{title: "View", canNavigate: false}} />
                </Route>
                <Route path="outstanding" element={<OutstandingEinvoices />} handle={{title: "Not Yet Submitted", canNavigate: true}} />
                <Route path="consolidation" element={<ConsolidationPage />} handle={{title: "Consolidated (POS)", canNavigate: true}} />
                <Route path="pos-pending" element={<PendingConsolidationPage />} handle={{title: "POS Not Yet Consolidated", canNavigate: true}} />
                <Route path="settings" element={<EinvoiceSettings />} handle={{title: "MyInvois Settings", canNavigate: true}} />
            </Route>

            <Route path="/inventory" element={<ModuleLayout />} handle={{title: "Item & Inventory", module: "inventory", canNavigate: true}} >
                <Route index element={<Navigate to="items" replace />} />
                {crudRoutes({path: "items", basePath: ITEMS_PATH, title: "Items", newLabelKey: "newItem", List: Items, Create: CreateItem, Edit: EditItem})}
                <Route path="item-movements" handle={{title: "Item Movement", canNavigate: true}}>
                    <Route index element={<ItemMovements />} handle={{hide: true}} />
                    <Route path=":id" element={<ViewItemMovement />} handle={{title: "View", canNavigate: false}} />
                </Route>
                {crudRoutes({path: "adjustments", basePath: ADJUSTMENTS_PATH, title: "Adjustments", newLabelKey: "newItemAdjustment", List: Adjustments, Create: CreateAdjustment, Edit: EditAdjustment})}
                {crudRoutes({path: "location-transfers", basePath: TRANSFERS_PATH, title: "Location Transfers", newLabelKey: "newLocationTransfer", List: Transfers, Create: CreateTransfer, Edit: EditTransfer})}
                {crudRoutes({path: "sales-pricing", basePath: SALES_PRICING_PATH, title: "Sales Pricing", newLabelKey: "newSalesPrice", List: SalesPricing, Create: CreateSalesPrice, Edit: EditSalesPrice})}
                {crudRoutes({path: "purchasing-pricing", basePath: PURCHASING_PRICING_PATH, title: "Purchasing Pricing", newLabelKey: "newPurchasePrice", List: PurchasingPricing, Create: CreatePurchasePrice, Edit: EditPurchasePrice})}

                <Route path="standard-costs" handle={{title: "Standard Costs", canNavigate: true}}>
                    <Route index element={<StandardCosts />} handle={{hide: true}} />
                    <Route path=":id" element={<EditStandardCost />} handle={{title: "Edit", canNavigate: false}} />
                </Route>

                <Route path="setup" handle={{title: "Setup", canNavigate: false}}>
                    {inventorySetupRoutes("/inventory/setup")}
                </Route>
            </Route>

            <Route path="/settings" element={<NewAccountTriggerProvider><ModuleLayout /></NewAccountTriggerProvider>} handle={{title: "Settings", canNavigate: true}} >
                <Route index element={<SettingsHome />} handle={{hide: true}} />

                <Route path="organization" handle={{ title: 'Organization', module: "settings_organization"}}>
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<Profile />} handle={{title: "Profile", canNavigate: true}} />
                    <Route path="display-preference" element={<DisplayPreference />} handle={{title: "Display Preference", canNavigate: true}} />
                    <Route path="system-setup" element={<SystemSetup />} handle={{title: "System Setup", canNavigate: true}} />
                    {/* moved to their own sections; old links land there */}
                    <Route path="einvoice" element={<Navigate to="/settings/einvoice/myinvois" replace />} />
                    <Route path="users" element={<Navigate to="/settings/user-management/users" replace />} />
                    <Route path="roles/*" element={<Navigate to="/settings/user-management/roles" replace />} />
                    {crudRoutes({path: "document-numbering", basePath: "/settings/organization/document-numbering", title: "Document No", newLabelKey: "newDocumentNumbering", List: DocumentNumberings, Create: CreateDocumentNumbering, Edit: EditDocumentNumbering})}
                </Route>

                <Route path="sales" handle={{ title: 'Sales', module: "settings_sales"}}>
                    {salesSetupRoutes("/settings/sales")}
                </Route>

                <Route path="inventory" handle={{ title: 'Inventory', module: "settings_inventory"}}>
                    {inventorySetupRoutes("/settings/inventory")}
                </Route>

                <Route path="banking" handle={{ title: 'Banking', module: "settings_banking"}}>
                    {bankingSetupRoutes("/settings/banking")}
                </Route>

                <Route path="gl" handle={{ title: 'General Ledger', module: "settings_gl"}}>
                    {glSetupRoutes("/settings/gl")}
                </Route>

                <Route path="einvoice" handle={{ title: 'E-Invoice', module: "settings_einvoice"}}>
                    <Route index element={<Navigate to="myinvois" replace />} />
                    {/* also in the E-Invoice module at /einvoice/settings */}
                    <Route path="myinvois" element={<EinvoiceSettings />} handle={{title: "MyInvois Settings", canNavigate: true}} />
                </Route>

                <Route path="user-management" handle={{ title: 'User Management', module: "settings_users"}}>
                    <Route index element={<Navigate to="users" replace />} />
                    <Route path="users" element={<Users />} handle={{title: "Users", canNavigate: true}} />
                    <Route path="roles" handle={{title: "Roles & Access", canNavigate: true}}>
                        <Route index element={<Roles />} handle={{hide: true}} />
                        <Route path="create" element={<CreateRole />} handle={{title: "Create", canNavigate: false}} />
                        <Route path=":id" element={<EditRole />} handle={{title: "Edit", canNavigate: false}} />
                    </Route>
                </Route>

                <Route path="taxes" handle={{ title: 'Taxes', module: "settings_taxes"}}>
                    <Route index element={<Navigate to="taxes" replace />} />
                    {crudRoutes({path: "taxes", basePath: "/settings/taxes/taxes", title: "Taxes", newLabelKey: "newTax", List: TaxTypes, Create: CreateTaxType, Edit: EditTaxType})}
                    {crudRoutes({path: "tax-groups", basePath: "/settings/taxes/tax-groups", title: "Tax Groups", newLabelKey: "newTaxGroup", List: TaxGroups, Create: CreateTaxGroup, Edit: EditTaxGroup})}
                    {crudRoutes({path: "item-tax-types", basePath: "/settings/taxes/item-tax-types", title: "Item Tax Types", newLabelKey: "newItemTaxType", List: ItemTaxTypes, Create: CreateItemTaxType, Edit: EditItemTaxType})}
                </Route>
            </Route>
        </Route>
    )
)
