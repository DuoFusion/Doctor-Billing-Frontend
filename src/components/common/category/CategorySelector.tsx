import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../api";
import { Select, Typography } from "antd";
import { resolveObjectId } from "../../../utils/medicalStoreScope";

const CategorySelector = ({
  value,
  onChange,
  className,
  placeholder = "Select Category",
  filterMedicalStoreId,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  filterMedicalStoreId?: string;
}) => {
  const scopedMedicalStoreId = String(filterMedicalStoreId || "").trim();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", scopedMedicalStoreId],
    queryFn: () => getCategories(scopedMedicalStoreId ? { medicalStoreId: scopedMedicalStoreId } : undefined),
    enabled: !!scopedMedicalStoreId,
  });

  const userCategories = (() => {
    const payload = categoriesData?.data;
    if (!payload || !Array.isArray(payload)) return [] as string[];

    if (!scopedMedicalStoreId) return [] as string[];

    return Array.from(
      new Set(
        payload
          .filter((d: any) => resolveObjectId(d?.medicalStoreId) === scopedMedicalStoreId)
          .map((d: any) => d?.name)
          .filter(Boolean)
      )
    );
  })();

  if (!scopedMedicalStoreId) {
    return <Typography.Text className="!text-[#6d8060]">No categories available. Please add a category first.</Typography.Text>;
  }

  if (!userCategories || userCategories.length === 0) {
    return <Typography.Text className="!text-[#6d8060]">No categories available. Please add a category first.</Typography.Text>;
  }

  return (
    <Select
      value={value || undefined}
      onChange={(v) => onChange(v)}
      placeholder={placeholder}
      options={userCategories.map((c: string) => ({ value: c, label: c }))}
      className={className || "!w-full"}
    />
  );
};

export default CategorySelector;
