// fund.js - 基金模組路由配置（簡化版）
export default [
  // ==== 後台基金管理 ====

  // 基金管理儀表板
  {
    path: "fund/dashboard",
    component: () => import("@/views/back/fund/Dashboard.vue"),
    meta: { pageId: 5 },
  },

  // 基金資料管理（合併新增、編輯、列表功能）
  {
    path: "fund/management",
    component: () => import("@/views/back/fund/FundManagement.vue"),
    meta: { pageId: 5 },
  },

  // 基金淨值管理（合併淨值更新、歷史、管理功能）
  {
    path: "fund/nav-management",
    component: () => import("@/views/back/fund/NavManagement.vue"),
    meta: { pageId: 5 },
  },

  // 基金交易審核（合併單筆、批量、詳情功能）
  {
    path: "fund/transaction-approval",
    component: () => import("@/views/back/fund/TransactionApproval.vue"),
    meta: { pageId: 5 },
  },

  // 資料查詢（合併所有查詢功能）
  {
    path: "fund/data-query",
    component: () => import("@/views/back/fund/DataQuery.vue"),
    meta: { pageId: 5 },
  },

  // ==== 前台基金功能 ====

  // 基金首頁（自動檢查帳戶狀態）
  {
    path: 'fund/index',
    component: () => import('@/views/front/fund/FundIndex.vue'),
  },

  // 基金帳戶管理（合併申辦、詳情、風險評量功能）
  {
    path: "fund/account",
    component: () => import("@/views/front/fund/FundAccount.vue"),
  },

  // 基金搜尋與詳情（合併搜尋、詳情功能）
  {
    path: "fund/search",
    component: () => import("@/views/front/fund/FundSearch.vue"),
  },

  // 基金持倉與交易（合併持倉、申購、贖回功能）
  {
    path: "fund/trading",
    component: () => import("@/views/front/fund/FundTrading.vue"),
  },

  // 交易記錄與績效（合併交易記錄、狀態查詢、績效分析）
  {
    path: "fund/records",
    component: () => import("@/views/front/fund/FundRecords.vue"),
  }
];