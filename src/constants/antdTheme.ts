export const antdThemeConfig = {
  token: {
    colorPrimary: "#6f9554",
    colorInfo: "#6f9554",
    colorSuccess: "#3a592b",
    colorWarning: "#b98526",
    colorError: "#dc2626",
    colorBgBase: "#fefffc",
    colorTextBase: "#2d4620",
    borderRadius: 10,
  },
  components: {
    Button: { primaryShadow: "none" },
    Card: { boxShadow: "none" },
    Input: { activeShadow: "none", activeBorderColor: "#6f9554", hoverBorderColor: "#b8d69a" },
    Select: { activeOutlineColor: "transparent" },
  },
};

export default antdThemeConfig;
