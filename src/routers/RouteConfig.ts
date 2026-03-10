import { ROUTES } from "../constants/Routes";

export const routes = [
  { path: ROUTES.AUTH.SIGNIN, title: "Sign In" },
  { path: ROUTES.AUTH.VERIFY_OTP, title: "OTP Verification" },
  { path: ROUTES.AUTH.FORGET_PASSWORD, title: "Forget Password" },
  { path: ROUTES.AUTH.OTP_VERIFY_RESET_PASSWORD, title: "Reset Password" },

  { path: ROUTES.USER.DASHBOARD, title: "Dashboard" },
  { path: ROUTES.USER.PROFILE, title: "Profile" },

  { path: ROUTES.ADMIN.DASHBOARD, title: "Dashboard" },
  {path : ROUTES.ADMIN.MANAGE_USERS , title : "Manage Users"},
  {path : ROUTES.ADMIN.ADD_USERS , title : "Add New User"},

  { path: ROUTES.PRODUCTS.GET_PRODUCTS, title: "Products Management" },
  { path: ROUTES.PRODUCTS.ADD_PRODUCT, title: "Add Product" },
  { path: ROUTES.PRODUCTS.UPDATE_PRODUCT, title: "Update Product" },

  { path: ROUTES.COMPANY.GET_COMPANY, title: "Company Management" },
  { path: ROUTES.COMPANY.ADD_COMPANY, title: "Add Company" },
  { path: ROUTES.COMPANY.UPDATE_COMPANY, title: "Update Company" },
  { path: ROUTES.COMPANY.VIEW_COMPANY, title: "Company Details" },

  { path: ROUTES.BILL.GET_BILLS, title: "Bill Management" },
  { path: ROUTES.BILL.GENERATE_BILL, title: "Generate Bill" },
  {path : ROUTES.BILL.VIEW_INVOICE , title : "Invoice Bill"}
  ,
  { path: ROUTES.CATEGORY.GET_CATEGORIES, title: "Category Management" },
  { path: ROUTES.CATEGORY.ADD_CATEGORY, title: "Add Category" },

  { path: ROUTES.MEDICAL_STORE.GET_MEDICAL_STORES, title: "Medical Store Management" },
  { path: ROUTES.MEDICAL_STORE.ADD_MEDICAL_STORE, title: "Add Medical Store" },
  { path: ROUTES.MEDICAL_STORE.UPDATE_MEDICAL_STORE, title: "Update Medical Store" }
];
