export default [
  // 後台
  {
    path: "fund",
    component: () => import("@/views/back/fund/fund.vue"),
  },

  // 前台
  {
    path: "fundHome",
    component: () => import("@/views/front/fund/fundHome.vue"),
  },
];
