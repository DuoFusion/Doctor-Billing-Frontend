import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../../../api";
import { updateMedicalStore } from "../../../api/medicalStore";
import { Button, Card, Form, Typography, Upload } from "antd";
import type { UploadFile } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { getCurrentUserRecord, syncCurrentUserCache, useCurrentUser, useMedicalStoreDetails,} from "../../../hooks";
import type { CurrentUserProfile, MedicalStoreRecord, ProfileMedicalFormValues, ProfileUpdateResponse,} from "../../../types";
import { resolveUserMedicalStoreId } from "../../../utils/medicalStoreScope";
import { notify } from "../../../utils/notify";
import { getSignatureImageUrl } from "../../../utils/uploadsUrl";
import ProfileDetailsUserFormFields from "./ProfileDetailsUserFormFields";

const resolveTextValue = (nextValue: string | undefined, existingValue: string | undefined) => (nextValue ?? existingValue ?? "").trim();

const resolveStoreTextValue = ( nextValue: string | undefined, existingValue: string | number | undefined) => {
  if (nextValue === undefined) return String(existingValue ?? "").trim();
  return nextValue.trim();
};

const resolveUppercaseValue = (nextValue: string | undefined, existingValue: string | undefined) => {
  if (nextValue === undefined) return String(existingValue ?? "").trim().toUpperCase();
  return nextValue.trim().toUpperCase();
};

const syncUserFields = (form: ReturnType<typeof Form.useForm<ProfileMedicalFormValues>>[0],user?: CurrentUserProfile) => {
  form.setFieldsValue({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
};

const syncMedicalStoreFields = ( form: ReturnType<typeof Form.useForm<ProfileMedicalFormValues>>[0], medicalStore?: MedicalStoreRecord) => {
  if (!medicalStore) return;

  form.setFieldsValue({
    storeName: medicalStore?.name || "",
    taxType: medicalStore?.taxType || "SGST_CGST",
    taxPercent: Number(medicalStore?.taxPercent ?? 0),
    gstNumber: (medicalStore?.gstNumber || "").toUpperCase(),
    panNumber: (medicalStore?.panNumber || "").toUpperCase(),
    address: medicalStore?.address || "",
    city: medicalStore?.city || "",
    state: medicalStore?.state || "",
    pincode: medicalStore?.pincode ? String(medicalStore.pincode) : "",
    defaultCompanyAddress: medicalStore?.defaultCompanyAddress || "",
    defaultCompanyCity: medicalStore?.defaultCompanyCity || "",
    defaultCompanyState: medicalStore?.defaultCompanyState || "",
    defaultCompanyPincode: medicalStore?.defaultCompanyPincode ? String(medicalStore.defaultCompanyPincode) : "",
  });
};

const clearMedicalStoreFields = ( form: ReturnType<typeof Form.useForm<ProfileMedicalFormValues>>[0]) => {
  form.setFieldsValue({
    storeName: "",
    taxType: "SGST_CGST",
    taxPercent: 0,
    gstNumber: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    defaultCompanyAddress: "",
    defaultCompanyCity: "",
    defaultCompanyState: "",
    defaultCompanyPincode: "",
  });
};

const ProfileDetailsUserForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProfileMedicalFormValues>();
  const [signatureFileList, setSignatureFileList] = useState<UploadFile[]>([]);
  const [signature, setSignature] = useState<File | null>(null);
  const [removeSignature, setRemoveSignature] = useState(false);

  const { data: userData, isLoading } = useCurrentUser();
  const user = getCurrentUserRecord(userData);
  const selectedMedicalStoreId = resolveUserMedicalStoreId(user);
  const { data: medicalStore, isLoading: isMedicalStoreLoading } = useMedicalStoreDetails(
  selectedMedicalStoreId,
    {
      enabled: Boolean(selectedMedicalStoreId),
      staleTime: 5 * 60 * 1000,
    }
  );
  const watchedTaxType = Form.useWatch("taxType", form);
  const taxType = (watchedTaxType || medicalStore?.taxType || "SGST_CGST") as "SGST_CGST" | "IGST";

  const existingSignatureUrl = getSignatureImageUrl(medicalStore?.signatureImg);
  const hasExistingSignature = Boolean(
    medicalStore?.signatureImg?.filename || medicalStore?.signatureImg?.path
  );

  useEffect(() => {
    if (!user) return;
    syncUserFields(form, user);
  }, [form, user]);

  useEffect(() => {
    if (!selectedMedicalStoreId) {
      clearMedicalStoreFields(form);
      return;
    }

    if (medicalStore) { syncMedicalStoreFields(form, medicalStore)}
    }, [form, medicalStore, selectedMedicalStoreId]);

  useEffect(() => {
    if (existingSignatureUrl) {
      setSignatureFileList([
        {
          uid: "-1",
          name:
            medicalStore?.signatureImg?.originalName ||
            medicalStore?.signatureImg?.filename ||
            "signature",
          status: "done",
          url: existingSignatureUrl,
        },
      ]);
    } else {
      setSignatureFileList([]);
    }

    setSignature(null);
    setRemoveSignature(false);
  }, [
    existingSignatureUrl,
    medicalStore?.signatureImg?.filename,
    medicalStore?.signatureImg?.originalName,
  ]);

  const mutation = useMutation({
    mutationFn: async (payload: { profileData: { name: string; email: string; phone: string }; storeData?: Record<string, unknown>; }) => {
      const profileResponse = await updateUserProfile(payload.profileData);
      let updatedStore: MedicalStoreRecord | undefined;
      let storeUpdateError = "";

      if (selectedMedicalStoreId && payload.storeData && Object.keys(payload.storeData).length > 0) {
        try {
          const storeResponse = await updateMedicalStore(selectedMedicalStoreId, payload.storeData);
          updatedStore = (storeResponse?.store || storeResponse) as MedicalStoreRecord | undefined;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            storeUpdateError = error.response?.data?.message || "Medical store update failed";
          } else {
            storeUpdateError = "Medical store update failed";
          }
        }
      }
      return { profileResponse, updatedStore, storeUpdateError, };
    },
    onSuccess: (result) => {
      syncCurrentUserCache(queryClient, result.profileResponse as ProfileUpdateResponse);
      syncUserFields(form, getCurrentUserRecord(result.profileResponse as ProfileUpdateResponse));

      // Ensure any components relying on the current user cache see the latest data immediately.
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      if (selectedMedicalStoreId && result.updatedStore) {
        syncMedicalStoreFields(form, result.updatedStore);
        queryClient.setQueryData<MedicalStoreRecord | undefined>(["medicalStore", selectedMedicalStoreId], (prev) =>
          ({
            ...(prev || {}),
            ...result.updatedStore,
          } as MedicalStoreRecord)
        );
        queryClient.invalidateQueries({ queryKey: ["medicalStore", selectedMedicalStoreId] });

        const updatedSignatureUrl = getSignatureImageUrl(result.updatedStore.signatureImg);
        if (updatedSignatureUrl) {
          setSignatureFileList([
            {
              uid: "-1",
              name:
                result.updatedStore.signatureImg?.originalName ||
                result.updatedStore.signatureImg?.filename ||
                "signature",
              status: "done",
              url: updatedSignatureUrl,
            },
          ]);
        } else {
          setSignatureFileList([]);
        }
      }

      setSignature(null);
      setRemoveSignature(false);

      if (result.storeUpdateError) {
        notify.warning(`Profile updated, but ${result.storeUpdateError}`);
        return;
      }
      notify.success("Profile updated successfully.");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update profile");
        return;
      }
      notify.error("An unexpected error occurred");
    },
  });

  const handleSignatureUpload = (file: File) => {
    const isValidType = ["image/jpeg", "image/png"].includes(file.type);
    if (!isValidType) {
      notify.error("Only JPG, JPEG, and PNG files are allowed");
      return Upload.LIST_IGNORE;
    }

    const isValidSize = file.size <= 5 * 1024 * 1024;
    if (!isValidSize) {
      notify.error("File size must be less than 5MB");
      return Upload.LIST_IGNORE;
    }

    setSignature(file);
    setRemoveSignature(false);
    return false;
  };

  const handleUppercaseChange =
    (field: "gstNumber" | "panNumber") => (event: { target?: { value?: string } }) => {
      form.setFieldValue(field, String(event?.target?.value || "").toUpperCase());
    };

  const handleSignatureChange = (info: { fileList: UploadFile[] }) => {
    setSignatureFileList(info.fileList);
    const nextFile = info.fileList[0]?.originFileObj as File | undefined;

    if (nextFile) {
      setSignature(nextFile);
      setRemoveSignature(false);
      return;
    }

    setSignature(null);
    if (hasExistingSignature) {
      setRemoveSignature(true);
    }
  };

  const handleRemoveSignature = () => {
    setSignatureFileList([]);
    setSignature(null);
    if (hasExistingSignature) {
      setRemoveSignature(true);
    }
  };

  const handleFinish = (values: ProfileMedicalFormValues) => {
    const profileData = {
      name: resolveTextValue(values.name, user?.name),
      email: resolveTextValue(values.email, user?.email),
      phone: resolveTextValue(values.phone, user?.phone),
    };

    let storeData: Record<string, unknown> | undefined;
    if (selectedMedicalStoreId && medicalStore) {
      storeData = {
        taxType: values.taxType || medicalStore.taxType || "SGST_CGST",
        taxPercent: Number(values.taxPercent ?? medicalStore.taxPercent ?? 0),
        gstNumber: resolveUppercaseValue(values.gstNumber, medicalStore.gstNumber),
        panNumber: resolveUppercaseValue(values.panNumber, medicalStore.panNumber),
        address: resolveStoreTextValue(values.address, medicalStore.address),
        city: resolveStoreTextValue(values.city, medicalStore.city),
        state: resolveStoreTextValue(values.state, medicalStore.state),
        pincode: resolveStoreTextValue(values.pincode, medicalStore.pincode),
        defaultCompanyAddress: resolveStoreTextValue(values.defaultCompanyAddress, medicalStore.defaultCompanyAddress),
        defaultCompanyCity: resolveStoreTextValue(values.defaultCompanyCity, medicalStore.defaultCompanyCity),
        defaultCompanyState: resolveStoreTextValue(values.defaultCompanyState, medicalStore.defaultCompanyState),
        defaultCompanyPincode: resolveStoreTextValue(values.defaultCompanyPincode, medicalStore.defaultCompanyPincode),
      };

      const resolvedStoreName = resolveStoreTextValue(values.storeName, medicalStore.name);
      if (resolvedStoreName) {
        storeData.name = resolvedStoreName;
      }

      if (signature) {
        storeData.signatureImg = signature;
      }

      if (hasExistingSignature && removeSignature && !signature) {
        storeData.removeSignature = true;
      }
    }
    mutation.mutate({ profileData, storeData});
  };

  return (
    <Card className="!rounded-xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none", textShadow: "none" }} styles={{ body: { padding: 0 } }} loading={isLoading} >
      <div className="border-b border-[#e3edd9] px-4 py-4 sm:px-6">
        <Typography.Title level={5} className="!mb-1 !text-[#2d4620]"> Profile Settings</Typography.Title>
        <Typography.Text className="!text-[13px] !text-[#6d8060]"> Keep your account information up to date.</Typography.Text>
      </div>

      <Form<ProfileMedicalFormValues> form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} className="app-form profile-settings-form">
        
        <ProfileDetailsUserFormFields
          selectedMedicalStoreId={selectedMedicalStoreId}
          isMedicalStoreLoading={isMedicalStoreLoading}
          medicalStore={medicalStore}
          taxType={taxType}
          existingSignatureUrl={existingSignatureUrl || undefined}
          signatureFileList={signatureFileList}
          onUppercaseChange={handleUppercaseChange}
          onSignatureChange={handleSignatureChange}
          onSignatureUpload={handleSignatureUpload}
          onRemoveSignature={handleRemoveSignature}
        />

        <div className="flex flex-wrap gap-3 border-t border-[#e3edd9] px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
          <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-10 !rounded-lg !px-7 !font-semibold" style={{ boxShadow: "none" }} > Update Profile </Button>
          <Button type="default" onClick={() => navigate(ROUTES.AUTH.CHANGE_PASSWORD)} className="!h-10 !rounded-lg !px-5 !font-semibold" style={{ boxShadow: "none" }}> Change Password</Button>
        </div>
      </Form>
    </Card>
  );
};

export default ProfileDetailsUserForm;
