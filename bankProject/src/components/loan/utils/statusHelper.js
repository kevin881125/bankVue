// src/utils/statusHelper.js
export const statusMap = {
  approved: "審核通過",
  rejected: "拒絕",
  supplement: "補件中",
  pending: "待審核",
};

export const translateStatus = (status) => {
  return statusMap[status?.toLowerCase()] || "未知狀態";
};
