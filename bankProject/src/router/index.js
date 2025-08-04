import { createRouter, createWebHistory } from "vue-router";
import memeber  from "@/router/member"
import account  from "@/router/account"
import loan  from "@/router/loan"
import creditCard  from "@/router/creditCard"
import fund  from "@/router/fund"

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
         ...loan,
         ...creditCard,
         ...fund
        
      ],
    },
    {
      path: "/backLogin",
      component: () => import("@/layouts/back/backLoginLayout.vue"),
    },
  ],
});

export default router;
