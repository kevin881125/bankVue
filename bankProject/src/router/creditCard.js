export default [
  // 後台
  {
    path: "creditCard",
    component: () => import("@/views/back/creditCard/creditCard.vue"),
  },

  {
    path: "creditCard/review",
    component: () => import("@/views/back/creditCard/creditCardReview.vue"),
  },
  // 前台
  {
    path: "cardApply",
    component: () => import("@/views/front/creditCard/cardApply.vue"),
  },

  {
    path: "creditTransaction",
    component: () => import("@/views/front/creditCard/creditTransaction.vue"),
  },

  {
    path: "myBill",
    component: () => import("@/views/front/creditCard/myBill.vue"),
  },
];
