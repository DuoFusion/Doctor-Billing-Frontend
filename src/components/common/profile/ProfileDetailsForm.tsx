import { Card } from "antd";
import { getCurrentUserRecord, useCurrentUser } from "../../../hooks";
import ProfileDetailsAdminForm from "./ProfileDetailsAdminForm";
import ProfileDetailsUserForm from "./ProfileDetailsUserForm";

const ProfileDetailsForm = () => {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Card
        className="!rounded-xl !border-[#d9e7c8] !bg-[#fefffc]"
        style={{ boxShadow: "none", textShadow: "none" }}
        loading
      />
    );
  }

  const role = String(getCurrentUserRecord(data)?.role || "").toLowerCase();
  return role === "admin" ? <ProfileDetailsAdminForm /> : <ProfileDetailsUserForm />;
};

export default ProfileDetailsForm;
