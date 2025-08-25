export default [
  // 後台
  {
    path: "fundBack",
    component: () => import("@/views/back/fund/fundBack.vue")
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
        path: "fundSip",
        component: () => import("@/views/back/fund/fundSip.vue"),
      },
    ]
  },
  // {
  //   path: "fundTrading",
  //   component: () => import("@/views/back/fund/fundTrading.vue"),
  //   children: [
  //     {
  //       path: "fund",
  //       component: () => import("@/views/back/fund/fund.vue"),
  //       children: [
  //         {
  //           path: "fundNav",
  //           component: () => import("@/views/back/fund/fundNav.vue"),
  //         },
  //       ]
  //     },
  //   ]
  // },
  // 前台
  {
    path: "myFund",
    component: () => import("@/views/front/fund/fundAccount.vue"),
    children: [
      // 申辦基金帳戶流程
      {
        path: 'fundAccountSetup',
        component: () => import("@/views/front/fund/fundAccountSetup.vue"),
      },
      // 持有基金
      {
        path: 'fundHoldings',
        component: () => import("@/views/front/fund/fundHoldings.vue"),
      },
      // 交易紀錄
      {
        path: 'fundTransactions',
        component: () => import("@/views/front/fund/fundTransaction.vue"),
      },
      // 定期定額
      {
        path: 'fundSips',
        component: () => import("@/views/front/fund/fundSip.vue"),
      },
    ]
  },
  {
    path: "buyFund",
    component: () => import("@/views/front/fund/fund.vue"),
    children: [
      // 單筆基金淨值
      {
        path: 'fundNav',
        component: () => import("@/views/front/fund/fundNav.vue"),
      },
      // 交易畫面
      {
        path: 'fundTrading',
        component: () => import("@/views/front/fund/fundTrading.vue"),
      },
    ]
  }
];
