export default [
  // 後台
  {
    path: "loan",
    component: () => import("@/views/back/loan/loan.vue"),
    meta: { pageId: 4 }
  },

  // 前台
  {
    path: "loanHome",
    component: () => import("@/views/front/loan/loanHome.vue"),
    children: [
      {
        path: "loanApplicationForm",
        component: () => import("@/components/loan/front/loanApplicationForm.vue"),
      },
    ],
  },
];
