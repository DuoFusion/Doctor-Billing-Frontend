
export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCreatedAndUpdatedAt = (createdAt?: string, updatedAt?: string) => {
  const created = formatDate(createdAt);
  const updated = formatDate(updatedAt);
  return (
    <div className="leading-6">
      <div>
        <span className="font-semibold text-[#4f6841]">Created:</span> {created}
      </div>
      <div>
        <span className="font-semibold text-[#4f6841]">Updated:</span> {updated}
      </div>
    </div>
  );
};

export default { formatDate, formatCreatedAndUpdatedAt };
