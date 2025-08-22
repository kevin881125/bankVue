import { createRouter, createWebHistory } from "vue-router";
import memeber from "@/router/member";
import accountapplication from "@/router/accountapplication";
import loan from "@/router/loan";
import creditCard from "@/router/creditCard";
import fund from "@/router/fund";
import account from "@/router/account";
import { usePermissionStore } from '@/stores/usePermissionStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /*主布局*/
    {
      path: "/yuzubank/backmain",
      component: () => import("@/layouts/back/backMainLayout.vue"),
      children: [
        ...memeber,
        ...account,
        ...accountapplication,
        ...loan,
        ...creditCard,
        ...fund,
      ],
    },
    {
      path: "/yuzubank/backLogin",
      component: () => import("@/layouts/back/backLoginLayout.vue"),
    },
    {
      path: "/yuzubank/frontLogin",
      component: () => import("@/layouts/front/FrontLoginLayoutnew.vue"),
    },

    {
      path: "/yuzubank",
      component: () => import("@/layouts/front/FrontHomeLayout.vue"),
      children: [
        ...memeber,
        ...account,
        ...accountapplication,
        ...loan,
        ...creditCard,
        ...fund,
        {
          path: "index",
          component: () => import("@/views/front/index.vue"),
        },
      ],
    },

  ],
});

router.beforeEach((to, from, next) => {
  const permissionStore = usePermissionStore()

  const pageId = to.meta.pageId
  

  
  // ✅ 若沒有 pageId（代表不需權限控制），直接放行
  if (!pageId) {
    next()
    return
  }
    if (permissionStore.allowedPages.length === 0) {
    // 如果沒有權限頁面，則跳轉到未授權頁面
    console.log("沒有頁面給你顯示陣列是空的");
    
    next('/unauthorized');
    return;
  }

  // ✅ 若權限資料已經載入，判斷是否有權限
  if (permissionStore.hasAccess(pageId)) {
    next()
  } else {
    // ❌ 沒有該權限，導向未授權頁
    next('/unauthorized') // 或你自己定義的頁
  }
})

export default router;
