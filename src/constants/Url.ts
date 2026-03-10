export const URL_KEYS = {
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNOUT : "/auth/signout",
    OTP_VERIFICATION: "/auth/otp/verify",
    FORGOT_PASSWORD_SEND_OTP: "/auth/forgot-password/send-otp",
    FORGOT_PASSWORD_RESET: "/auth/forgot-password/reset-password",
    GET_CURRENT_USER: "/account/me",
    UPDATE_PROFILE: "/account/profile/update",
    CHANGE_PASSWORD: "/account/password/change",
  },

  PRODUCT: {
    GET_PRODUCT: "/product/all",
    GET_MY_PRODUCTS: "/product/get/my-products",
    ADD_PRODUCT: "/product/add",
    GET_PRODUCT_BY_ID : "/product/:id",
    UPDATE_PRODUCT: "/product/:id",
    UPDATE_PRODUCT_STATUS: "/product/:id/status",
    DELETE_PRODUCT: "/product/delete/:id",
  },

  COMPANY: {
    GET_COMPANY: "/company/all",   
    ADD_COMPANY: "/company/add",
    UPDATE_COMPANY: "/company/:id",
    GET_COMPANY_BY_ID : "/company/:id",
    UPDATE_COMPANY_STATUS: "/company/:id/status",
    DELETE_COMPANY: "/company/delete/:id",
  },

  BILL: {
    GET_BILLS: "/bill/all",
    GET_BILL_BY_ID: "/bill/:id",
    ADD_BILL: "/bill/add",
    UPDATE_BILL: "/bill/:id",
    UPDATE_BILL_STATUS: "/bill/:id/status",
    DELETE_BILL: "/bill/delete/:id",
  },

  USER: {
    ADD_USER: "/user/add",
    GET_USERS: "/user/all",
    GET_USER_BY_ID: "/user/:id" ,
    UPDATE_USER: "/user/:id",
    UPDATE_USER_STATUS: "/user/:id/status",
    DELETE_USER: "/user/delete/:id",

  },

  CATEGORY: {
    GET_CATEGORIES: "/category/all",
    ADD_CATEGORY: "/category/add",
    GET_CATEGORY_BY_ID: "/category/:id",
    UPDATE_CATEGORY: "/category/:id",
    UPDATE_CATEGORY_STATUS: "/category/:id/status",
    DELETE_CATEGORY: "/category/delete/:id",
  },

  MEDICAL_STORE: {
    GET_STORES: "/medical-store/all",
    GET_STORE_BY_ID: "/medical-store/:id",
    ADD_STORE: "/medical-store/add",
    UPDATE_STORE: "/medical-store/:id",
    UPDATE_STORE_STATUS: "/medical-store/:id/status",
    DELETE_STORE: "/medical-store/delete/:id",
  },

  DASHBOARD: {
    GET_STATS: "/dashboard/stats",
  },

  UPLOAD: {
    GET_IMAGE: "/upload",
    ADD: "/upload",
    UPDATE: "/upload",
    DELETE: "/upload",
  },
};

