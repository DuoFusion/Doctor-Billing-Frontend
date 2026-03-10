import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Modal, Progress, Typography } from "antd";

type ConfirmActiveStatusModalProps = {
  open: boolean;
  nextIsActive: boolean;
  countdown: number;
  subjectName?: string;
  entityLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
};

const ConfirmActiveStatusModal = ({
  open,
  nextIsActive,
  countdown,
  subjectName,
  entityLabel = "User",
  onConfirm,
  onCancel,
  confirmLoading = false,
}: ConfirmActiveStatusModalProps) => {
  return (
    <Modal
      open={open}
      centered
      closable
      maskClosable={false}
      onCancel={onCancel}
      className="app-confirm-active-status-modal"
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ebffd8] text-[#5a7e40]">
            <ClockCircleOutlined className="animate-bounce text-xl" />
          </span>
          <div>
            <Typography.Text strong className="text-base text-[#2d4620]">
              {nextIsActive ? `Activate ${entityLabel}` : `Deactivate ${entityLabel}`}
            </Typography.Text>
            <div className="text-sm text-[#6d8060]">Auto-confirm in {countdown}s</div>
          </div>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={confirmLoading}>
          Cancel
        </Button>,
        <Button key="apply" type="primary" danger={!nextIsActive} onClick={onConfirm} loading={confirmLoading}>
          Apply Now
        </Button>,
      ]}
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 rounded-xl bg-[#f4faec] p-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#dff3ca] text-[#5a7e40]">
            <UserOutlined />
          </span>
          <div>
            <Typography.Text strong>{subjectName || `Selected ${entityLabel.toLowerCase()}`}</Typography.Text>
            <div className="text-sm text-[#6d8060]">
              {nextIsActive
                ? `This ${entityLabel.toLowerCase()} will move to the Active list.`
                : `This ${entityLabel.toLowerCase()} will move to the Inactive list.`}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d9e7c8] bg-[#f7fde8] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-[#4f6841]">
            <span>Countdown</span>
            <span>{countdown}s</span>
          </div>
          <Progress
            percent={(countdown / 10) * 100}
            showInfo={false}
            strokeColor="#6f9554"
            trailColor="#d9e7c8"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmActiveStatusModal;
