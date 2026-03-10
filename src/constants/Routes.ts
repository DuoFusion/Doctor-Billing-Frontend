export const ROUTES = {
  AUTH: {
    SIGNIN: "/auth/signin",
    VERIFY_OTP: "/auth/verify-otp",
    FORGET_PASSWORD: "/resetForgetPassword" ,
    OTP_VERIFY_RESET_PASSWORD : "/verifyOTP/resetPassword",
    CHANGE_PASSWORD: "/changePassword"
  },

  ADMIN: {
    DASHBOARD: "/dashboard",
    MANAGE_USERS : "/manage/users",
    ADD_USERS : "/addNew/user",
    UPDATE_USER: "/update-user/:id",
    PROFILE : "/profile"
  },

  USER: {
    DASHBOARD: "/dashboard",
    PROFILE : "/profile"
  },

  PRODUCTS:{ 
    GET_PRODUCTS : "/products",
    ADD_PRODUCT : "/add-product",
    UPDATE_PRODUCT: "/update-product/:id" 
  },

  COMPANY:{
    GET_COMPANY :  "/company",
    ADD_COMPANY : "/add-company",
    UPDATE_COMPANY: "/update-company/:id",
    VIEW_COMPANY: "/company/:id/view",
  },

  BILL: {
    GET_BILLS : "/bill",
    GENERATE_BILL : "/generate-bill",
    UPDATE_BILL: "/update-bill/:id" ,
    VIEW_INVOICE : "/invoice-bill/:id"
  },

  CATEGORY: {
    GET_CATEGORIES: "/categories",
    ADD_CATEGORY: "/add-category",
  },

  MEDICAL_STORE: {
    GET_MEDICAL_STORES: "/medical-store",
    ADD_MEDICAL_STORE: "/add-medical-store",
    UPDATE_MEDICAL_STORE: "/update-medical-store/:id",
    VIEW_MEDICAL_STORE: "/medical-store/:id/view",
  },

  NOT_FOUND: "*",
};
