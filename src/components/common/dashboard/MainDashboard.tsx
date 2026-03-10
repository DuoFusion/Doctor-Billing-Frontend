import { Building2, FolderTree, Package, Receipt, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import BillRecentTable from "./BillRecentTable";
import { buildMedicalStoreOptions, useBills, useCurrentUser, useMedicalStores, useDashboardStats } from "../../../hooks";
import { filterStoresByIds, resolveUserMedicalStoreIds } from "../../../utils/medicalStoreScope";

const dashboardSelectClass =
  "!h-11 !w-full sm:!w-[260px] [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";

const MainDashboard = () => {
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");

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

  useEffect(() => {
    if (isAdmin) return;
    if (selectedMedicalStore) return;
    if (medicalStoreOptions.length === 0) return;
    setSelectedMedicalStore(medicalStoreOptions[0].value);
  }, [isAdmin, selectedMedicalStore, medicalStoreOptions]);

  const dashboardMedicalStoreId = isAdmin ? selectedMedicalStore : "";
  const isDashboardEnabled = Boolean(currentUserData?.user);
  const { data: billsData } = useBills(dashboardMedicalStoreId, isDashboardEnabled);
  const { data: statsData } = useDashboardStats(dashboardMedicalStoreId, isDashboardEnabled);

  const allBills = billsData?.bills || [];
  const stats = statsData?.stats || { bills: 0, products: 0, companies: 0, categories: 0, users: 0 };

  const cards = [
    { title: "Total Bills", value: stats.bills ?? 0, icon: Receipt },
    { title: "Total Products", value: stats.products ?? 0, icon: Package },
    { title: "Total Companies", value: stats.companies ?? 0, icon: Building2 },
    { title: "Total Categories", value: stats.categories ?? 0, icon: FolderTree },
    ...(isAdmin ? [{ title: "Total Users", value: stats.users ?? 0, icon: Users }] : []),
  ];

  const cardGridClass = isAdmin
    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="min-h-[calc(100vh-72px)] space-y-6 bg-transparent px-4 py-2 text-[#29483c] sm:px-6">
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#d9e7c8] bg-[#fefffc] p-4">
          <Select
            value={selectedMedicalStore || undefined}
            onChange={(value) => setSelectedMedicalStore(value || "")}
            options={medicalStoreOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select Medical Store"
            className={dashboardSelectClass}
          />
        </div>
      )}

      <div className={cardGridClass}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-[#d9e7c8] bg-[#fefffc] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6d8060]">{card.title}</p>
                <div className="rounded-lg border border-[#cfe4b7] bg-[#ebffd8] p-2.5 text-[#4f6841]">
                  <Icon size={18} />
                </div>
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-[#2d4620]">{card.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BillRecentTable bills={allBills} currentUserRole={role} />
      </div>
    </div>
  );
};

export default MainDashboard;
