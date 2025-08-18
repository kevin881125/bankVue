export default [
  {
     path: "member",
      component: () => import("@/views/back/member/member.vue")
  },

  // 前台
  {
     path: "memberProfile",
      component: () => import("@/views/front/member/memberProfile.vue")

  },
  {
     path: "memberforget",
      component: () => import("@/views/front/member/forgetPassword.vue")
  },
    {
     path: "memberResetPassword",
      component: () => import("@/views/front/member/resetPassword.vue")
  }
]