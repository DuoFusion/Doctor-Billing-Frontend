import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { getAuthToken } from "../api/client";
import { ROUTES } from "../constants/Routes";
import AppLoader from "../components/common/loader/AppLoader";

const Layout = lazy(() => import("../layout/Layout"));

const Signin = lazy(() => import("../pages/auth/Signin"));
const OtpVerification = lazy(() => import("../pages/auth/OtpVerification"));
const ResetForgetPassword = lazy(() => import("../pages/auth/ResetForgetPassword"));
const VerifyOtpAndChangePass = lazy(() => import("../components/auth/VerifyOtpAndChangePass"));

const Dashboard = lazy(() => import("../pages/global/dashboard/Dashboard"));
const Products = lazy(() => import("../pages/global/product/Products"));
const Companies = lazy(() => import("../pages/global/company/Companies"));
const CompanyDetails = lazy(() => import("../pages/global/company/CompanyDetails"));
const Bills = lazy(() => import("../pages/global/bill/Bills"));
const Category = lazy(() => import("../pages/global/category/Category"));
const AddCategory = lazy(() => import("../pages/global/category/AddCategory"));
const AddCompany = lazy(() => import("../pages/global/company/AddCompany"));
const AddProduct = lazy(() => import("../pages/global/product/AddProduct"));
const GenerateBill = lazy(() => import("../pages/global/bill/GenerateBill"));
const InvoiceBill = lazy(() => import("../pages/global/bill/InvoiceBill"));
const Profile = lazy(() => import("../pages/global/profile/Profile"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

// medical store pages
const MedicalStores = lazy(() => import("../pages/global/medicalStore/MedicalStores"));
const AddMedicalStore = lazy(() => import("../pages/global/medicalStore/AddMedicalStore"));

const ManageUsers = lazy(() => import("../pages/admin/ManageUsers"));
const AddUser = lazy(() => import("../pages/admin/AddUser"));

const RouteLoader = () => <AppLoader tip="Loading your workspace..." />;

const sharedRoutes = [
  { path: ROUTES.PRODUCTS.GET_PRODUCTS, element: <Products /> },
  { path: ROUTES.CATEGORY.GET_CATEGORIES, element: <Category /> },
  { path: ROUTES.COMPANY.GET_COMPANY, element: <Companies /> },
  { path: ROUTES.BILL.GET_BILLS, element: <Bills /> },
  { path: ROUTES.PRODUCTS.ADD_PRODUCT, element: <AddProduct /> },
  { path: ROUTES.CATEGORY.ADD_CATEGORY, element: <AddCategory /> },
  { path: ROUTES.PRODUCTS.UPDATE_PRODUCT, element: <AddProduct /> },
  { path: ROUTES.COMPANY.ADD_COMPANY, element: <AddCompany /> },
  { path: ROUTES.COMPANY.UPDATE_COMPANY, element: <AddCompany /> },
  { path: ROUTES.COMPANY.VIEW_COMPANY, element: <CompanyDetails /> },
  { path: ROUTES.BILL.GENERATE_BILL, element: <GenerateBill /> },
  { path: ROUTES.BILL.UPDATE_BILL, element: <GenerateBill /> },
  { path: ROUTES.BILL.VIEW_INVOICE, element: <InvoiceBill /> },
];

const AllRoute = () => {
  const hasToken = Boolean(getAuthToken());

  const { data, isPending } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  if (isPending && hasToken) {
    return <RouteLoader />;
  }

  const role = data?.user?.role ?? null;
  const isAuthenticated = role === "admin" || role === "user";

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {!isAuthenticated && (
          <>
            <Route path="/" element={<Navigate to={ROUTES.AUTH.SIGNIN} replace />} />
            <Route path={ROUTES.AUTH.SIGNIN} element={<Signin />} />
            <Route path={ROUTES.AUTH.VERIFY_OTP} element={<OtpVerification />} />
            <Route path={ROUTES.AUTH.FORGET_PASSWORD} element={<ResetForgetPassword />} />
            <Route path={ROUTES.AUTH.OTP_VERIFY_RESET_PASSWORD} element={<VerifyOtpAndChangePass />} />
            <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.AUTH.SIGNIN} replace />} />
          </>
        )}

        {isAuthenticated && (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            {sharedRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path={ROUTES.USER.PROFILE} element={<Profile />} />
            <Route path={ROUTES.AUTH.CHANGE_PASSWORD} element={<ChangePassword />} />

            {role === "admin" && (
              <>
                <Route path={ROUTES.MEDICAL_STORE.GET_MEDICAL_STORES} element={<MedicalStores />} />
                <Route path={ROUTES.MEDICAL_STORE.ADD_MEDICAL_STORE} element={<AddMedicalStore />} />
                <Route path={ROUTES.MEDICAL_STORE.UPDATE_MEDICAL_STORE} element={<AddMedicalStore />} />

                <Route path={ROUTES.ADMIN.MANAGE_USERS} element={<ManageUsers />} />
                <Route path={ROUTES.ADMIN.ADD_USERS} element={<AddUser />} />
                <Route path={ROUTES.ADMIN.UPDATE_USER} element={<AddUser />} />
              </>
            )}

            <Route path={ROUTES.AUTH.SIGNIN} element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path={ROUTES.AUTH.VERIFY_OTP} element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path={ROUTES.AUTH.FORGET_PASSWORD} element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path={ROUTES.AUTH.OTP_VERIFY_RESET_PASSWORD} element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />

            <Route path={ROUTES.NOT_FOUND} element={<h1>404 Page Not Found</h1>} />
          </Route>
        )}
      </Routes>
    </Suspense>
  );
};

export default AllRoute;
