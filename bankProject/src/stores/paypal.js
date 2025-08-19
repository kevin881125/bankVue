// src/stores/paypal.js
import { defineStore } from "pinia";

export const usePaypalStore = defineStore("paypal", {
  state: () => ({ sdkLoaded: false }),
  actions: {
    async ensureSdkLoadedTWD() {
      if (this.sdkLoaded && window && window.paypal) return;

      // 移除舊 SDK（避免載入過舊參數）
      document
        .querySelectorAll('script[src*="paypal.com/sdk/js"]')
        .forEach((s) => s.parentElement && s.parentElement.removeChild(s));

      const clientId = import.meta.env.VITE_PP_CLIENT_ID || "";
      if (!clientId) throw new Error("缺少 VITE_PP_CLIENT_ID（請在 .env 設定）");

      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.id = "paypal-sdk";
        s.src =
          "https://www.paypal.com/sdk/js" +
          `?client-id=${encodeURIComponent(clientId)}` +
          `&currency=TWD&components=buttons`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("PayPal SDK 載入失敗"));
        document.body.appendChild(s);
      });

      this.sdkLoaded = true;
    },
  },
});
