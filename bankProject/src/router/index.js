import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /*主布局*/
    {
      path: "/backmain",
      component: () => import("@/layouts/back/backMainLayout.vue"),
      children: [
        {
          path: "member",
          component: () => import("@/views/back/member/member.vue"),
        },
        {
          path: "memberProfile",
          component: () => import("@/views/back/member/memberProject.vue"),
        },
      ],
    },
    {
      path: "/backLogin",
      component: () => import("@/layouts/back/backLoginLayout.vue"),
    },
  ],
});

export default router;
