
export const renderNameEmail = (name?: string, email?: string) => {
  const safeName = (name || '').trim() || '-';
  const safeEmail = (email || '').trim() || '-';

  return (
    <div className="leading-5">
      <div>
        <span className="font-semibold text-[#4f6841]">Name :</span> {safeName}
      </div>
      <div>
        <span className="font-semibold text-[#4f6841]">Email :</span> {safeEmail}
      </div>
    </div>
  );
};

export default renderNameEmail;