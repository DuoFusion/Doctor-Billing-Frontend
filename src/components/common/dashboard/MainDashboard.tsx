import { Building2, CircleDollarSign, FolderTree, HandCoins, Package, Receipt, Tags, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { buildCompanyOptions, buildMedicalStoreOptions, useCompanies, useCurrentUser, useMedicalStores, useDashboardStats } from "../../../hooks";
import { filterStoresByIds, resolveUserMedicalStoreId, resolveUserMedicalStoreIds } from "../../../utils/medicalStoreScope";
import DashboardFilters from "./DashboardFilters";

const MainDashboard = () => {
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const formatAmount = (value?: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
    return `Rs ${formatted}`;
  }; 

  const { data: currentUserData } = useCurrentUser({
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const role = currentUserData?.user?.role;
  const isAdmin = role === "admin";

  const { data: storesData } = useMedicalStores();
  const stores = storesData?.stores || [];

  const allStoreIds = useMemo(
    () => stores.map((store) => store._id),
    [stores]
  );

  const allowedStoreIds = useMemo(() => {
    if (isAdmin) return allStoreIds;
    return resolveUserMedicalStoreIds(currentUserData?.user);
  }, [isAdmin, currentUserData?.user, allStoreIds]);

  const medicalStoreOptions = useMemo(
    () => buildMedicalStoreOptions(filterStoresByIds(stores, allowedStoreIds), allowedStoreIds),
    [stores, allowedStoreIds]
  );

  const companyStoreId = isAdmin ? selectedMedicalStore : resolveUserMedicalStoreId(currentUserData?.user) || "";
  const { data: companiesData } = useCompanies(isAdmin ? "" : companyStoreId, true, isAdmin);
  const companies = companiesData?.companies || [];
  const companyOptions = useMemo(() => {
    const options = isAdmin
      ? companies.map((company: any) => ({ value: company._id, label: company.name }))
      : buildCompanyOptions(companies, companyStoreId);

    return options.sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), undefined, { sensitivity: "base" })
    );
  }, [companies, companyStoreId, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    if (selectedMedicalStore) return;
    if (medicalStoreOptions.length === 0) return;
    setSelectedMedicalStore(medicalStoreOptions[0].value);
  }, [isAdmin, selectedMedicalStore, medicalStoreOptions]);

  const dashboardMedicalStoreId = isAdmin ? selectedMedicalStore : "";
  const fromDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const toDate = dateRange?.[1]?.format("YYYY-MM-DD");
  const isDashboardEnabled = Boolean(currentUserData?.user);
  const { data: statsData, isLoading: isStatsLoading, isFetching: isStatsFetching } = useDashboardStats( dashboardMedicalStoreId, fromDate, toDate, isDashboardEnabled, selectedCompany || undefined);

  const stats = statsData?.stats || { bills: 0, paidBills: 0, dueBills: 0, paidAmount: 0, dueAmount: 0, financials: 0, incomeCount: 0, expenseCount: 0, financialAmount: 0, incomeAmount: 0, expenseAmount: 0, products: 0, companies: 0, categories: 0, users: 0,};
  const showStatsLoading = isDashboardEnabled && (isStatsLoading || isStatsFetching);

  const totalBillAmount = (stats.paidAmount ?? 0) + (stats.dueAmount ?? 0);

  const billCards = [
    { title: "Total Bills", value: stats.bills ?? 0, icon: Receipt },
    { title: "Paid Bills", value: stats.paidBills ?? 0, icon: CircleDollarSign },
    { title: "Due Bills", value: stats.dueBills ?? 0, icon: HandCoins },
    { title: "Amount", value: formatAmount(totalBillAmount), icon: Tags },
    { title: "Paid Amount", value: formatAmount(stats.paidAmount), icon: CircleDollarSign },
    { title: "Due Amount", value: formatAmount(stats.dueAmount), icon: HandCoins },
  ];

  const financialCards = [
    { title: "Financial", value: stats.financials ?? 0, icon: Receipt },
    { title: "Income", value: stats.incomeCount ?? 0, icon: CircleDollarSign },
    { title: "Expense", value: stats.expenseCount ?? 0, icon: HandCoins },
    { title: "Profit", value: formatAmount(stats.financialAmount), icon: Tags },
    { title: "Income Amount", value: formatAmount(stats.incomeAmount), icon: CircleDollarSign },
    { title: "Expense Amount", value: formatAmount(stats.expenseAmount), icon: HandCoins },
  ];

  const otherCards = [
    { title: "Total Products", value: stats.products ?? 0, icon: Package },
    { title: "Total Companies", value: stats.companies ?? 0, icon: Building2 },
    { title: "Total Categories", value: stats.categories ?? 0, icon: FolderTree },
    ...(isAdmin ? [{ title: "Total Users", value: stats.users ?? 0, icon: Users }] : []),
  ];

  const billGridClass ="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const otherGridClass = isAdmin ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const financialGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="min-h-[calc(100vh-72px)] space-y-4 bg-transparent px-4 py-4 text-[#29483c] sm:px-6">
      <DashboardFilters isAdmin={isAdmin} selectedMedicalStore={selectedMedicalStore} onMedicalStoreChange={setSelectedMedicalStore} medicalStoreOptions={medicalStoreOptions} selectedCompany={selectedCompany} onCompanyChange={setSelectedCompany} companyOptions={companyOptions} dateRange={dateRange} onDateRangeChange={setDateRange}/>
    
      <section className="space-y-2 mt-10">
        <div className="flex items-center justify-between">
          <div className="leading-none">
            <h3 className="mt-0 text-xl font-semibold text-[#2d4620]">Billing Overview</h3>
          </div>
        </div>

        <div className={`${billGridClass} mt-2`}>
          {billCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="rounded-2xl border border-[#d9e7c8] bg-[#fefffc] p-5 shadow-[0_8px_20px_rgba(79,104,65,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#6d8060]">{card.title}</p>
                  <div className="rounded-lg border border-[#cfe4b7] bg-[#ebffd8] p-2.5 text-[#4f6841]">
                    <Icon size={18} />
                  </div>
                </div>
                {showStatsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#6d8060]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#b8d69a] border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <h2 className="mt-3 text-3xl font-semibold text-[#2d4620]">{card.value}</h2>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2 mt-10">
        <div className="flex items-center justify-between">
          <div className="leading-none">
            <h3 className="mt-0 text-xl font-semibold text-[#2d4620]">Financial Overview</h3>
          </div>
        </div>

        <div className={`${financialGridClass} mt-2`}>
          {financialCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="rounded-2xl border border-[#d9e7c8] bg-[#fefffc] p-5 shadow-[0_8px_20px_rgba(79,104,65,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#6d8060]">{card.title}</p>
                  <div className="rounded-lg border border-[#cfe4b7] bg-[#ebffd8] p-2.5 text-[#4f6841]">
                    <Icon size={18} />
                  </div>
                </div>
                {showStatsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#6d8060]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#b8d69a] border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <h2 className="mt-3 text-3xl font-semibold text-[#2d4620]">{card.value}</h2>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2 mt-10">
        <div className="flex items-center justify-between">
          <div className="leading-none">
            <h3 className="mt-0 text-xl font-semibold text-[#2d4620]">Inventory Overview</h3>
          </div>
        </div>

        <div className={`${otherGridClass} mt-2`}>
          {otherCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="rounded-2xl border border-[#d9e7c8] bg-[#fefffc] p-5 shadow-[0_8px_20px_rgba(79,104,65,0.08)]" >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#6d8060]">{card.title}</p>
                  <div className="rounded-lg border border-[#cfe4b7] bg-[#ebffd8] p-2.5 text-[#4f6841]">
                    <Icon size={18} />
                  </div>
                </div>
                {showStatsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#6d8060]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#b8d69a] border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <h2 className="mt-3 text-3xl font-semibold text-[#2d4620]">{card.value}</h2>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default MainDashboard;
