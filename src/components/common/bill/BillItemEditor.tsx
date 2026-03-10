import { Button, Input, Select, Typography } from "antd";

type BillItemEditorProps = {
  selectedCompany: string;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;

  qty: number | "";
  setQty: (value: number | "") => void;

  freeQty: number | "";
  setFreeQty: (value: number | "") => void;

  mrp: string;
  setMrp: (value: string) => void;

  rate: string;
  setRate: (value: string) => void;

  productsForCompany: Array<{ _id: string; name: string }>;
  isProductsLoading?: boolean;

  itemErrors: {
    product?: string;
    qty?: string;
    freeQty?: string;
    mrp?: string;
    rate?: string;
  };

  editingItemIndex: number | null;
  itemCount: number;
  onAddItem: () => void;
  onCancelEdit: () => void;
};

const inputClass = "!h-11 !rounded-lg";

const selectClass =
  "!h-11 !w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#cfe4b7] [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";

const requiredLabel = (label: string) => (
  <span className="font-medium text-[#607257]">
    {label}
    <span className="ml-1 text-red-500">*</span>
  </span>
);

const BillItemEditor = ({
  selectedCompany,
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
  productsForCompany,
  isProductsLoading,
  itemErrors,
  editingItemIndex,
  itemCount,
  onAddItem,
  onCancelEdit,
}: BillItemEditorProps) => (
  <>
    <Typography.Title level={5} className="!mb-5 !text-[#2d4620]">
      Add Product Item
    </Typography.Title>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
      
      {/* Product */}
      <div>
        <Typography.Text className="!mb-2 !block">
          {requiredLabel("Product")}
        </Typography.Text>

        <Select
          value={selectedProduct || undefined}
          onChange={setSelectedProduct}
          options={productsForCompany.map((product) => ({
            value: product._id,
            label: product.name,
          }))}
          placeholder="Select Product"
          disabled={!selectedCompany}
          className={selectClass}
          loading={Boolean(selectedCompany) && isProductsLoading}
        />

        {itemErrors.product && (
          <p className="mt-2.5 text-sm text-red-600">{itemErrors.product}</p>
        )}
      </div>

      {/* MRP */}
      <div>
        <Typography.Text className="!mb-2 !block">
          {requiredLabel("MRP")}
        </Typography.Text>

        <Input
          type="number"
          step={0.01}
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
          disabled={!selectedCompany}
          min={0}
          className={inputClass}
        />

        {itemErrors.mrp && (
          <p className="mt-2.5 text-sm text-red-600">{itemErrors.mrp}</p>
        )}
      </div>

      {/* Purchase Price */}
      <div>
        <Typography.Text className="!mb-2 !block">
          {requiredLabel("Purchase Price")}
        </Typography.Text>

        <Input
          type="number"
          step={0.01}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          disabled={!selectedCompany}
          min={0}
          className={inputClass}
        />

        {itemErrors.rate && (
          <p className="mt-2.5 text-sm text-red-600">{itemErrors.rate}</p>
        )}
      </div>

      {/* Qty */}
      <div>
        <Typography.Text className="!mb-2 !block">
          {requiredLabel("Qty")}
        </Typography.Text>

        <Input
          type="number"
          value={qty}
          onChange={(event) =>
            setQty(event.target.value === "" ? "" : Number(event.target.value))
          }
          disabled={!selectedCompany}
          min={1}
          className={inputClass}
        />

        {itemErrors.qty && (
          <p className="mt-2.5 text-sm text-red-600">{itemErrors.qty}</p>
        )}
      </div>

      {/* Free Qty */}
      <div>
        <Typography.Text className="!mb-2 !block">
          <span className="font-medium text-[#607257]">Free Qty</span>
        </Typography.Text>

        <Input
          type="number"
          value={freeQty}
          onChange={(event) =>
            setFreeQty(event.target.value === "" ? "" : Number(event.target.value))
          }
          disabled={!selectedCompany}
          min={0}
          className={inputClass}
        />

        {itemErrors.freeQty && (
          <p className="mt-2.5 text-sm text-red-600">{itemErrors.freeQty}</p>
        )}
      </div>
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="primary"
          onClick={onAddItem}
          disabled={!selectedCompany}
          className="!h-11 !rounded-lg !px-6"
        >
          {editingItemIndex !== null ? "Update Item" : "Add Item"}
        </Button>

        {editingItemIndex !== null && (
          <Button onClick={onCancelEdit} className="!h-11 !rounded-lg !px-6">
            Cancel Edit
          </Button>
        )}
      </div>

      <Typography.Text className="!text-[#6d8060]">
        {itemCount} item(s) added
      </Typography.Text>
    </div>
  </>
);

export default BillItemEditor;