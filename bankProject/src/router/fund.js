export default [
  // 後台
  {
    path: "fundBack",
    component: () => import("@/views/back/fund/fundBack.vue"),
    meta: { pageId: 5 }
  },
  {
    path: "fundTrading",
    component: () => import("@/views/back/fund/fundTrading.vue"),
  },
  {
    path: "fundAccount",
    component: () => import("@/views/back/fund/fundAccount.vue"),
    children: [
      {
        path: "fundHoldings",
        component: () => import("@/views/back/fund/fundHoldings.vue"),
      },
      {
        path: "fundTransaction",
        component: () => import("@/views/back/fund/fundTransaction.vue"),
      },
      {
        path: "fundSip",
        component: () => import("@/views/back/fund/fundSip.vue"),
      },
    ]
  },
  {
    path: "fund",
    component: () => import("@/views/back/fund/fund.vue"),
    children: [
      {
        path: "fundNav",
        component: () => import("@/views/back/fund/fundNav.vue"),
      },
    ]
  },

  // 前台
  {
    path: "myFund",
    component: () => import("@/views/front/fund/myFund.vue"),
    children: [
      // 持有基金
      {
        path: 'myFundHoldings',
        component: () => import("@/views/front/fund/myFundHoldings.vue"),
      },
      // 交易紀錄
      {
        path: 'myFundTransaction',
        component: () => import("@/views/front/fund/myFundTransaction.vue"),
      },
      // 定期定額
      {
        path: 'myFundSip',
        component: () => import("@/views/front/fund/myFundSip.vue"),
      },
      // 申購基金
      {
        path: "buyFund",
        component: () => import("@/views/front/fund/buyFund.vue"),
      }
    ]
  },
];
