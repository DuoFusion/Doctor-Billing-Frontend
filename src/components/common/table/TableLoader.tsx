import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const TableLoader = ({ tip = "Loading..." }: { tip?: string }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} tip={tip} />
    </div>
  );
};

export default TableLoader;
