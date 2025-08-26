import axios from "axios";
import { useWorkerStore } from "@/stores/Worker";
const workerStore = useWorkerStore();

// === 建立 apiService 物件，設定基礎屬性 ===
const apiService = axios.create({
  baseURL: "http://localhost:8080/bank",
});

// === 請求攔截器 ===
apiService.interceptors.request.use((config) => {
  const token = workerStore.token;
  // 請求前附加 token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  if (config.data instanceof FormData) {
    console.log("我有變圖片檔");

    config.headers["Content-Type"] = "multipart/form-data";
  }

  return config;
});

// === 回應攔截器 ===
apiService.interceptors.response.use(
  (response) => {
    if (response.config.isDownload) {

      return response; // 直接回傳完整 response 物件
    }
    return response.data;
  },
  (error) => {
    if (!error.status) {
      return;
    }

    // 回應的錯誤處理寫在這
    const { status, data } = error.response;

    // 參數錯誤
    if (status == 400) {
      alert(`請求參數錯誤:${data}`);
      return;
    }

    // 登入失敗或 token 過期
    if (status == 401) {
      alert(`${data}`);

      workerStore.logout();
      return;
    }
  }
);

export const request = (config) => apiService(config);
