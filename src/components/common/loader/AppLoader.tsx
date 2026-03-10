import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";

interface AppLoaderProps {
  tip?: string;
  fullScreen?: boolean;
  className?: string;
}

const AppLoader = ({ tip = "Loading...", fullScreen = true, className = "" }: AppLoaderProps) => {
  const shellClass = fullScreen ? "app-loader-shell-full" : "app-loader-shell-inline";
  const combinedClassName = `app-loader-shell ${shellClass} ${className}`.trim();

  return (
    <div className={combinedClassName}>
      <div className="app-loader-card">
        <div className="app-loader-ring">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 34, color: "#6f9554" }} spin />} />
        </div>
        <Typography.Text className="app-loader-text">{tip}</Typography.Text>
      </div>
    </div>
  );
};

export default AppLoader;
