import { Button, Card, Input, Radio, Select, Spin, Switch, Typography } from "antd";
import { useBillForm } from "../../../hooks";
import BillAmountSummary from "./BillAmountSummary";
import BillItemEditor from "./BillItemEditor";
import BillItemsTable from "./BillItemsTable";

const paymentOptions = ["Cash", "Credit"].map((method) => ({
  label: method,
  value: method,
}));

const requiredLabel = (label: string) => (
  <span className="font-medium text-[#607257]">
    {label}
    <span className="ml-1 text-red-500">*</span>
  </span>
);

const inputClass = "!h-11 !rounded-lg";
const selectClass =
  "!h-11 !w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#cfe4b7] [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const secondaryButtonClass =
  "!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-6 !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]";
const GenerateBillForm = () => {
  const {
    isEdit,
    isAdmin,
    goBack,
    isPageLoading,
    isCompaniesLoading,
    isProductsLoading,
    isProductsFetching,
    isBillError,
    billRecord,
    selectedMedicalStoreId,
    selectedBillUserId,
    setSelectedBillUserId,
    selectedCompany,
    setSelectedCompany,
    billNumber,
    setBillNumber,
    purchaseDate,
    setPurchaseDate,
    selectedProduct,
    setSelectedProduct,
    qty,
    setQty,
    freeQty,
    setFreeQty,
    mrp,
    setMrp,
    rate,
    setRate,
    items,
    editingItemIndex,
    paymentMethod,
    setPaymentMethod,
    billDiscount,
    setBillDiscount,
    isGstEnabled,
    setIsGstEnabled,
    itemErrors,
    formErrors,
    userSelectOptions,
    companySelectOptions,
    productsForStore,
    discountedSubtotal,
    taxType,
    taxPercent,
    sgstAmount,
    cgstAmount,
    igstAmount,
    sgstPercent,
    cgstPercent,
    grandTotal,
    mutation,
    resetItemEditor,
    clearItems,
    addItemToList,
    editItem,
    removeItem,
    handleSubmit,
  } = useBillForm();

  if (isPageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isEdit && isBillError && !billRecord) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2">
        <Typography.Title level={4} className="!text-[#29483c]">
          Unable to load bill for editing
        </Typography.Title>
        <Typography.Text type="secondary">
          The bill may not exist, or you may not have permissions to edit it.
        </Typography.Text>
        <Button onClick={goBack} className="!mt-4">
          Back to Bills
        </Button>
      </div>
    );
  }

  return (
    <div className="app-form-layout app-form-layout-wide">
      <Card className="app-form-card rounded-2xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Typography.Title level={3} className="!mb-0 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent">
            {isEdit ? "Update Bill" : "Generate Bill"}
          </Typography.Title>
          <Button onClick={goBack} className={secondaryButtonClass}>
            Back
          </Button>
        </div>

        <form className="app-form space-y-9" onSubmit={handleSubmit}>
          {isAdmin && (
            <div>
              <Typography.Text className="!mb-2 !block">{requiredLabel("Select User")}</Typography.Text>
              <Select
                value={selectedBillUserId || undefined}
                onChange={(value) => {
                  setSelectedBillUserId(value);
                  setSelectedCompany("");
                  clearItems();
                  resetItemEditor();
                }}
                options={userSelectOptions}
                showSearch
                optionFilterProp="label"
                placeholder="Select User"
                className={selectClass}
                loading={isAdmin && isCompaniesLoading}
              />
              {formErrors.user && <p className="mt-2.5 text-sm text-red-600">{formErrors.user}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <Typography.Text className="!mb-2 !block">{requiredLabel("Bill Number")}</Typography.Text>
              <Input
                type="text"
                value={billNumber}
                onChange={(event) => setBillNumber(event.target.value)}
                required
                className={inputClass}
              />
              {formErrors.billNumber && <p className="mt-2.5 text-sm text-red-600">{formErrors.billNumber}</p>}
            </div>

            <div>
              <Typography.Text className="!mb-2 !block">{requiredLabel("Purchase Date")}</Typography.Text>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                required
                className={inputClass}
              />
              {formErrors.purchaseDate && <p className="mt-2.5 text-sm text-red-600">{formErrors.purchaseDate}</p>}
            </div>

            <div>
              <Typography.Text className="!mb-2 !block">{requiredLabel("Select Company")}</Typography.Text>
              <Select
                value={selectedCompany || undefined}
                onChange={(value) => {
                  setSelectedCompany(value);
                  clearItems();
                  resetItemEditor();
                }}
                options={companySelectOptions}
                showSearch
                filterOption={(input, option) =>
                  String((option as { searchLabel?: string })?.searchLabel || "").toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Select Company"
                disabled={!selectedMedicalStoreId}
                className={selectClass}
                loading={Boolean(selectedMedicalStoreId) && isCompaniesLoading}
              />
              {formErrors.company && <p className="mt-2.5 text-sm text-red-600">{formErrors.company}</p>}
            </div>
          </div>

          <div className="rounded-xl border border-[#d9e7c8] bg-[#fefffc] p-5">
            <BillItemEditor
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              qty={qty}
              setQty={setQty}
              freeQty={freeQty}
              setFreeQty={setFreeQty}
              mrp={mrp}
              setMrp={setMrp}
              rate={rate}
              setRate={setRate}
              productsForStore={productsForStore}
              isProductsLoading={isProductsLoading || isProductsFetching}
              itemErrors={itemErrors}
              editingItemIndex={editingItemIndex}
              itemCount={items.length}
              onAddItem={addItemToList}
              onCancelEdit={resetItemEditor}
            />

            {formErrors.items && <p className="mt-3 text-sm text-red-600">{formErrors.items}</p>}

            <BillItemsTable items={items} onEdit={editItem} onRemove={removeItem} />
          </div>

          <div>
            <Typography.Text className="!mb-3 !block">{requiredLabel("Payment Method")}</Typography.Text>
            <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} options={paymentOptions} />
            {formErrors.paymentMethod && <p className="mt-2.5 text-sm text-red-600">{formErrors.paymentMethod}</p>}
          </div>

          <div>
            <Typography.Text className="!mb-2 !block">
              <span className="font-medium text-[#607257]">Bill Discount</span>
            </Typography.Text>
            <Input
              step={0.01}
              type="number"
              value={billDiscount}
              onChange={(event) => setBillDiscount(event.target.value === "" ? "" : Number(event.target.value))}
              min={0}
              className={inputClass}
            />
          </div>

          <div>
            <Typography.Text className="!mb-2 !block">
              <span className="font-medium text-[#607257]"> GST Apply</span>
            </Typography.Text>
            <div className="flex items-center gap-3">
              <Switch checked={isGstEnabled} onChange={setIsGstEnabled} />
              <span className="text-sm text-[#607257]">{isGstEnabled ? "On" : "Off"}</span>
            </div>
          </div>

          <BillAmountSummary
            subtotal={discountedSubtotal}
            taxType={taxType}
            taxPercent={taxPercent}
            sgstAmount={sgstAmount}
            cgstAmount={cgstAmount}
            igstAmount={igstAmount}
            sgstPercent={sgstPercent}
            cgstPercent={cgstPercent}
            showGst={isGstEnabled}
            discount={billDiscount}
            grandTotal={grandTotal}
          />

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={goBack} className={secondaryButtonClass}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-11 !rounded-lg !px-7">
              {isEdit ? "Update Bill" : "Generate Bill"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GenerateBillForm;
