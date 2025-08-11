export default [
  {
     path: "creditCard",
      component: () => import("@/views/back/creditCard/creditCard.vue")
  },

  {
  path: "creditCard/review",
  component: () => import("@/views/back/creditCard/creditCardReview.vue")
},

{
    path: "creditCard/transaction",
    component: () => import("@/views/back/creditCard/creditTransaction.vue"),
  },
]






