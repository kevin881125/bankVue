export default [
  // 後台
  {
    path: "loan",
    component: () => import("@/views/back/loan/loan.vue"),
  },

  // 前台
  {
    path: "loanHome",
    component: () => import("@/views/front/loan/loanHome.vue"),
  },
];
