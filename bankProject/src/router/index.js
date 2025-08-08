import { createRouter, createWebHistory } from "vue-router";
import memeber from "@/router/member"
import accountapplication from "@/router/accountapplication"
import loan from "@/router/loan"
import creditCard from "@/router/creditCard"
import fund from "@/router/fund"
import account from "@/router/account"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    /*主布局*/
    {
      path: "/backmain",
      component: () => import("@/layouts/back/backMainLayout.vue"),
      children: [
        ...memeber,
        ...account,
        ...accountapplication,
        ...loan,
        ...creditCard,
        ...fund

      ],
    },
    {
      path: "/backLogin",
      component: () => import("@/layouts/back/backLoginLayout.vue"),
    },
    {
      path: "/fontLogin",
      component: () => import("@/layouts/front/FrontLoginLayout.vue"),
      children: [
        ...memeber,
        ...account,
        ...accountapplication,
        ...loan,
        ...creditCard,
        ...fund

      ],
    },
    
  ],
});

export default router;
