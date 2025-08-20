export default [
  // 後台
  {
    path: "account",
    component: () => import("@/views/back/account/account.vue"),
  },

  // 前台
  {
    path: "accountHome",
    component: () => import("@/views/front/account/accountHome.vue"),
  },
  {
    path: "openAccount",
    component: () => import("@/views/front/account/openAccount.vue"),
  }
];
