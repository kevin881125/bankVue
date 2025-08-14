export default [
  {
     path: "member",
      component: () => import("@/views/back/member/member.vue")
  },

  // 前台
  {
     path: "memberHome",
      component: () => import("@/views/front/member/memberArea.vue")

  }
]