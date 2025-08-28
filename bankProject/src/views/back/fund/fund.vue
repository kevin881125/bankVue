<template>
    <div class="fund-management-container">
        <!-- 頁面標題 -->
        <div class="page-header">
            <div class="header-content">
                <h2 class="page-title">
                    <i class="fas fa-chart-pie"></i>
                    基金管理
                </h2>
                <p class="page-subtitle">管理所有基金產品的資訊與設定</p>
            </div>

            <!-- 新增基金按鈕 -->
            <button class="add-fund-btn" @click="openCreateDialog">
                <i class="fas fa-plus"></i>
                新增基金
            </button>
        </div>

        <!-- 統計卡片 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon total">
                    <i class="fas fa-layer-group"></i>
                </div>
                <div class="stat-content">
                    <h3>總基金數</h3>
                    <p>{{ funds.length }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon active">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>開放中</h3>
                    <p>{{funds.filter(f => isOpenStatus(f.status)).length}}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon closed">
                    <i class="fas fa-pause-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>已關閉</h3>
                    <p>{{funds.filter(f => !isOpenStatus(f.status)).length}}</p>
                </div>
            </div>
        </div>

        <!-- 搜尋區 -->
        <div class="search-bar">
            <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input v-model="searchKeyword" type="text" placeholder="搜尋基金代碼、名稱或類型..." class="search-input" />
            </div>
        </div>

        <!-- 基金清單 -->
        <div class="table-container">
            <div class="table-header">
                <h3>
                    <i class="fas fa-list"></i>
                    基金清單
                </h3>
                <div class="table-actions">
                    <button class="refresh-btn" @click="fetchFunds" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        重新整理
                    </button>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="fund-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>基金代碼</th>
                            <th>基金名稱</th>
                            <th>基金類型</th>
                            <th>風險等級</th>
                            <th>最新淨值</th>
                            <th>淨值日期</th>
                            <th>手續費</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="fund in filteredFunds" :key="fund.fundId" class="table-row">
                            <td>{{ fund.fundId }}</td>
                            <td>
                                <span class="fund-code">{{ fund.fundCode || 'N/A' }}</span>
                            </td>
                            <td>
                                <div class="fund-name">{{ fund.fundName || '未知基金' }}</div>
                            </td>
                            <td>{{ getFundTypeLabel(fund.fundType) }}</td>
                            <td>
                                <div class="risk-level" :class="getRiskClass(fund.riskLevel)">
                                    {{ getRiskLevelText(fund.riskLevel) }}
                                </div>
                            </td>
                            <td class="nav-value">{{ formatCurrency(fund.latestNav) }}</td>
                            <td class="nav-date">{{ formatDate(fund.navDate) }}</td>
                            <td>{{ formatPercentage(fund.buyFee) }}</td>
                            <td>
                                <span class="status-badge" :class="getStatusClass(fund.status)">
                                    <i :class="getStatusIcon(fund.status)"></i>
                                    {{ getStatusText(fund.status) }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit-btn" @click="openEditDialog(fund)" title="編輯">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <!-- ✅ 新增「改變狀態」按鈕 -->
                                    <button
                                        class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                        @click="toggleFundStatusWithConfirm(fund)"
                                        :title="`${getToggleButtonText(fund.status)}基金`">
                                        {{ getToggleButtonText(fund.status) }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- 空狀態 -->
                <div v-if="filteredFunds.length === 0 && !loading" class="empty-state">
                    <i class="fas fa-folder-open empty-icon"></i>
                    <p class="empty-title">{{ searchKeyword ? '沒有找到匹配的基金' : '暫無基金資料' }}</p>
                    <p class="empty-subtitle">{{ searchKeyword ? '試試其他搜尋關鍵字' : '點擊上方「新增基金」按鈕開始新增' }}</p>
                </div>
            </div>
        </div>

        <!-- 新增/編輯基金彈窗 -->
        <div v-if="dialogVisible" class="modal-overlay" @click="closeDialog">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i :class="isEdit ? 'fas fa-edit' : 'fas fa-plus'"></i>
                        {{ isEdit ? "編輯基金" : "新增基金" }}
                    </h3>
                    <button class="close-btn" @click="dialogVisible = false">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- 一鍵輸入按鈕區域 (僅新增模式顯示) -->
                    <div v-if="!isEdit" class="quick-fill-section">
                        <h4 class="quick-fill-title">
                            <i class="fas fa-magic"></i>
                            一鍵輸入範例
                        </h4>
                        <div class="quick-fill-buttons">
                            <button v-for="template in fundTemplates" :key="template.id" class="quick-fill-btn"
                                @click="fillTemplate(template)" type="button">
                                <div class="template-icon" :style="{ background: template.color }">
                                    <i :class="template.icon"></i>
                                </div>
                                <div class="template-info">
                                    <div class="template-name">{{ template.name }}</div>
                                    <div class="template-desc">{{ template.description }}</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <form class="fund-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-code"></i>
                                    基金代碼 <span class="required">*</span>
                                </label>
                                <input v-model="form.fundCode" type="text" placeholder="輸入基金代碼" required />
                            </div>
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-tag"></i>
                                    基金名稱 <span class="required">*</span>
                                </label>
                                <input v-model="form.fundName" type="text" placeholder="輸入基金名稱" required />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-coins"></i>
                                    幣別 <span class="required">*</span>
                                </label>
                                <select v-model="form.currency" required>
                                    <option value="">請選擇幣別</option>
                                    <option value="TWD">台幣 (TWD)</option>
                                    <option value="USD">美金 (USD)</option>
                                    <option value="CNY">人民幣 (CNY)</option>
                                    <option value="EUR">歐元 (EUR)</option>
                                    <option value="JPY">日圓 (JPY)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-coins"></i>
                                    基金收款帳戶 <span class="required">*</span>
                                </label>
                                <input v-model="form.comAccId" type="text" required />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-chart-line"></i>
                                    基金類型
                                </label>
                                <select v-model="form.fundType">
                                    <option value="">請選擇基金類型</option>
                                    <option value="EQUITY">股票型</option>
                                    <option value="BOND">債券型</option>
                                    <option value="BALANCED">平衡型</option>
                                    <option value="MONEY_MARKET">貨幣市場型</option>
                                    <option value="INDEX">指數型</option>
                                    <option value="ETF">ETF</option>
                                    <option value="REIT">不動產型</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-exclamation-triangle"></i>
                                    風險等級
                                </label>
                                <select v-model="form.riskLevel">
                                    <option :value="1">RR1 - 保守型</option>
                                    <option :value="2">RR2 - 穩健型</option>
                                    <option :value="3">RR3 - 平衡型</option>
                                    <option :value="4">RR4 - 成長型</option>
                                    <option :value="5">RR5 - 積極型</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-dollar-sign"></i>
                                    最新淨值
                                </label>
                                <input v-model="form.latestNav" type="number" step="0.0001" placeholder="0.0000" />
                            </div>
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-percentage"></i>
                                    申購手續費 (%)
                                </label>
                                <input v-model="form.buyFee" type="number" step="0.01" placeholder="0.00" />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-toggle-on"></i>
                                    狀態
                                </label>
                                <select v-model="form.status">
                                    <option value="OPEN">開放申購</option>
                                    <option value="CLOSED">停止申購</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-calendar-alt"></i>
                                    淨值日期
                                </label>
                                <input v-model="form.navDate" type="date" />
                            </div>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button class="btn-cancel" @click="dialogVisible = false">
                        <i class="fas fa-times"></i>
                        取消
                    </button>
                    <button class="btn-save" @click="saveFund" :disabled="!isFormValid || saving">
                        <i class="fas fa-spinner fa-spin" v-if="saving"></i>
                        <i class="fas fa-save" v-else></i>
                        {{ saving ? '儲存中...' : '儲存' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 載入遮罩 -->
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>處理中...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const funds = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const saving = ref(false);
const searchKeyword = ref('');

const form = ref({
    fundId: null,
    fundCode: "",
    fundName: "",
    fundType: "",
    riskLevel: 1,
    latestNav: 0,
    navDate: null,
    buyFee: 0,
    status: "OPEN",
});

const apiUrl = "http://localhost:8080/bank/fund";

// 基金範本資料
const fundTemplates = ref([
    {
        id: 1,
        name: "台股基金",
        description: "台灣股票型基金",
        icon: "fas fa-flag",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        data: {
            fundCode: "TW001A",
            fundName: "台灣精選股票基金A類型",
            fundType: "EQUITY",
            riskLevel: 4,
            currency: "TWD",
            comAccId: "7110000054",
            latestNav: 15.2500,
            buyFee: 1.50,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    },
    {
        id: 2,
        name: "美股基金",
        description: "美國股票型基金",
        icon: "fas fa-star-spangled-banner",
        color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        data: {
            fundCode: "US001A",
            fundName: "美國成長股票基金A類型",
            fundType: "EQUITY",
            riskLevel: 5,
            currency: "USD",
            comAccId: "7110000054",
            latestNav: 18.7800,
            buyFee: 2.00,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    },
    {
        id: 3,
        name: "債券基金",
        description: "穩健債券型基金",
        icon: "fas fa-shield-alt",
        color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        data: {
            fundCode: "BD001A",
            fundName: "全球債券基金A類型",
            fundType: "BOND",
            riskLevel: 2,
            currency: "TWD",
            comAccId: "7110000054",
            latestNav: 10.5600,
            buyFee: 1.00,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    },
    {
        id: 4,
        name: "平衡基金",
        description: "股債平衡配置",
        icon: "fas fa-balance-scale",
        color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        data: {
            fundCode: "BL001A",
            fundName: "環球平衡基金A類型",
            fundType: "BALANCED",
            riskLevel: 3,
            currency: "TWD",
            comAccId: "7110000054",
            latestNav: 12.4300,
            buyFee: 1.25,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    },
    {
        id: 5,
        name: "指數基金",
        description: "追蹤市場指數",
        icon: "fas fa-chart-line",
        color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        data: {
            fundCode: "IDX001A",
            fundName: "台灣50指數基金",
            fundType: "INDEX",
            riskLevel: 4,
            currency: "TWD",
            comAccId: "7110000054",
            latestNav: 16.8900,
            buyFee: 0.50,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    },
    {
        id: 6,
        name: "貨幣基金",
        description: "短期貨幣市場",
        icon: "fas fa-coins",
        color: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
        data: {
            fundCode: "MM001A",
            fundName: "台幣貨幣市場基金",
            fundType: "MONEY_MARKET",
            riskLevel: 1,
            currency: "TWD",
            comAccId: "7110000054",
            latestNav: 10.0120,
            buyFee: 0.25,
            status: "OPEN",
            navDate: new Date().toISOString().split('T')[0]
        }
    }
]);

// 計算屬性
const filteredFunds = computed(() => {
    if (!searchKeyword.value) return funds.value;

    const keyword = searchKeyword.value.toLowerCase();
    return funds.value.filter(fund =>
        fund.fundCode?.toLowerCase().includes(keyword) ||
        fund.fundName?.toLowerCase().includes(keyword) ||
        fund.fundType?.toLowerCase().includes(keyword)
    );
});

// 修正後的表單驗證
const isFormValid = computed(() => {
    return form.value.fundCode && form.value.fundCode.trim() !== '' &&
        form.value.fundName && form.value.fundName.trim() !== '' &&
        form.value.fundType !== '' &&
        form.value.currency !== '' &&
        form.value.comAccId && form.value.comAccId.trim() !== '' &&
        parseFloat(form.value.latestNav || 0) > 0 &&
        form.value.navDate !== '' &&
        parseFloat(form.value.buyFee || 0) >= 0;
});

// 一鍵輸入範本資料
const fillTemplate = (template) => {
    Object.assign(form.value, template.data);
    console.log('已填入範本:', template.name, form.value);
};

// 載入基金清單
const fetchFunds = async () => {
    loading.value = true;
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('基金管理清單 API 回應:', res.data);

        // 處理不同的回應格式
        if (res.data) {
            if (Array.isArray(res.data)) {
                funds.value = res.data.map(fund => processFundData(fund));
            } else if (res.data.data && Array.isArray(res.data.data)) {
                funds.value = res.data.data.map(fund => processFundData(fund));
            } else {
                funds.value = [];
            }
        } else {
            funds.value = [];
        }

        console.log('處理後的基金資料:', funds.value);
    } catch (error) {
        console.error('載入基金清單失敗:', error);
        alert('載入基金清單失敗');
    } finally {
        loading.value = false;
    }
};

// 處理基金資料 - 對應 FundDto 結構
const processFundData = (fund) => {
    return {
        fundId: fund.fundId,
        fundCode: fund.fundCode || '',
        fundName: fund.fundName || '',
        latestNav: parseFloat(fund.latestNav || 0),
        navDate: fund.latestNavDate,
        fundType: fund.fundType || '',
        riskLevel: fund.riskLevel || 1,
        buyFee: parseFloat(fund.buyFee || 0),
        status: fund.status || 'OPEN'
    };
};

// 格式化函數
const formatDate = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
        const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return "N/A";
    }
};

const formatCurrency = (amount) => {
    if (!amount || amount === 0 || isNaN(amount)) return 'NT$ 0.00';
    return 'NT$ ' + Number(amount).toLocaleString('zh-TW', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
};

const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '0.00%';
    }
    return parseFloat(percentage).toFixed(2) + '%';
};

// 基金類型標籤轉換
const getFundTypeLabel = (fundType) => {
    const typeMap = {
        'EQUITY': '股票型',
        'BOND': '債券型',
        'BALANCED': '平衡型',
        'MONEY_MARKET': '貨幣市場型',
        'INDEX': '指數型',
        'ETF': 'ETF',
        'REIT': '不動產型'
    };
    return typeMap[fundType] || fundType || 'N/A';
};

// 獲取風險等級樣式
const getRiskClass = (level) => {
    const classes = {
        1: 'risk-1',
        2: 'risk-2',
        3: 'risk-3',
        4: 'risk-4',
        5: 'risk-5'
    };
    return classes[level] || 'risk-1';
};

const getRiskLevelText = (level) => {
    const texts = {
        1: 'RR1',
        2: 'RR2',
        3: 'RR3',
        4: 'RR4',
        5: 'RR5'
    };
    return texts[level] || 'RR1';
};

// 狀態相關函數
const isOpenStatus = (status) => {
    return status === 'OPEN' || status === '上架中';
};

const getStatusClass = (status) => {
    return isOpenStatus(status) ? 'open' : 'closed';
};

const getStatusText = (status) => {
    const statusMap = {
        'OPEN': '開放',
        'CLOSED': '關閉',
        '上架中': '開放',
        '已下架': '關閉'
    };
    return statusMap[status] || status || '未知';
};

const getStatusIcon = (status) => {
    return isOpenStatus(status) ? 'fas fa-play' : 'fas fa-pause';
};

// 彈窗操作
const openCreateDialog = () => {
    isEdit.value = false;
    form.value = {
        fundId: null,
        fundCode: "",
        fundName: "",
        fundType: "",
        comAccId: "",
        riskLevel: 4,
        currency: "TWD", // 修正為 TWD 而不是 "台幣"
        size: 1,
        minBuy: 1000,
        buyFee: 1.5,
        status: "OPEN", // 修正為 OPEN 而不是 "上架中"
        launchTime: new Date().toISOString().slice(0, 16),
        latestNav: 10,
        navDate: new Date().toISOString().split('T')[0],
    };
    dialogVisible.value = true;
};

const openEditDialog = (fund) => {
    isEdit.value = true;
    form.value = { ...fund };

    // 處理 datetime-local 格式
    if (fund.launchTime) {
        try {
            const date = new Date(fund.launchTime);
            form.value.launchTime = date.toISOString().slice(0, 16);
        } catch (error) {
            form.value.launchTime = new Date().toISOString().slice(0, 16);
        }
    }

    // 格式化日期以符合 date input 格式
    if (fund.navDate) {
        try {
            const date = new Date(fund.navDate);
            form.value.navDate = date.toISOString().split('T')[0];
        } catch (error) {
            form.value.navDate = new Date().toISOString().split('T')[0];
        }
    }

    dialogVisible.value = true;
};

const closeDialog = () => {
    dialogVisible.value = false;
};

// 修正後的儲存函數
const saveFund = async () => {
    if (!isFormValid.value) {
        alert('請填寫所有必填欄位');
        return;
    }

    saving.value = true;
    try {
        const payload = {
            fundCode: form.value.fundCode,
            fundName: form.value.fundName,
            fundType: form.value.fundType,
            riskLevel: parseInt(form.value.riskLevel),
            currency: form.value.currency,
            size: parseFloat(1),
            minBuy: parseFloat(1000),
            buyFee: parseFloat(form.value.buyFee),
            status: form.value.status,
            launchTime: form.value.launchTime,
            account: {
                accountId: parseInt(form.value.comAccId)
            },
            // 新增淨值相關資料
            initialNav: parseFloat(form.value.latestNav),
            navDate: form.value.navDate
        };

        console.log('基金儲存 payload:', payload);

        if (isEdit.value) {
            // 編輯模式：分別調用基金更新和淨值更新 API
            payload.fundId = form.value.fundId;
            await axios.put(`${apiUrl}/${form.value.fundId}`, payload);

            // 如果淨值有變更，單獨更新淨值
            if (form.value.latestNav && form.value.navDate) {
                await axios.post(`http://localhost:8080/bank/fund/${form.value.fundId}/nav`, {
                    nav: parseFloat(form.value.latestNav),
                    navDate: form.value.navDate
                });
            }
            alert("基金更新成功");
        } else {
            // 新增模式：使用帶淨值的創建端點
            const response = await axios.post(`${apiUrl}/with-nav`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            alert("基金新增成功");
        }

        dialogVisible.value = false;
        await fetchFunds();
    } catch (error) {
        console.error('儲存失敗:', error);
        console.error('錯誤詳細:', error.response?.data);

        let errorMessage = "操作失敗";

        if (error.response?.data?.message) {
            errorMessage += "：" + error.response.data.message;
        } else if (error.response?.status === 400) {
            errorMessage += "：資料格式錯誤";
        } else if (error.response?.status === 409) {
            errorMessage += "：基金代碼重複";
        } else if (error.response?.status === 500) {
            const errorDetail = JSON.stringify(error.response?.data || "");
            if (errorDetail.includes("fund_code")) {
                errorMessage += "：基金代碼已存在";
            } else if (errorDetail.includes("account")) {
                errorMessage += "：公司帳戶設定錯誤";
            } else {
                errorMessage += "：系統錯誤";
            }
        }

        alert(errorMessage);
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchFunds();
});
const toggleFundStatus = async (fund) => {
    try {
        // 根據當前狀態決定新狀態
        const newStatus = fund.status === 'OPEN' ? 'CLOSED' : 'OPEN';

        // 調用正確的 API 端點
        const response = await axios.put(`${apiUrl}/${fund.fundId}/status`, {
            status: newStatus,
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // 更新本地數據
        const fundIndex = funds.value.findIndex(f => f.fundId === fund.fundId);
        if (fundIndex !== -1) {
            funds.value[fundIndex].status = newStatus;
        }

        // 顯示成功訊息
        const statusText = newStatus === 'OPEN' ? '開放' : '關閉';
        console.log(`基金 ${fund.fundCode} 狀態已改為「${statusText}」`);

        // 如果有使用 UI 提示框架，可以替換為相應的提示方法
        alert(`基金狀態已改為「${statusText}」`);

    } catch (error) {
        console.error('更新基金狀態失敗:', error);
        console.error('錯誤詳細:', error.response?.data);

        let errorMessage = "更新基金狀態失敗";
        if (error.response?.data?.message) {
            errorMessage += "：" + error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage += "：找不到該基金";
        } else if (error.response?.status === 400) {
            errorMessage += "：請求參數錯誤";
        } else if (error.response?.status === 500) {
            errorMessage += "：系統錯誤";
        }

        alert(errorMessage);
    }
};
// 更新模板中的按鈕顯示文字函數
const getToggleButtonText = (status) => {
    return status === 'OPEN' ? '停用' : '啟用';
};

// 如果需要確認對話框的版本
const toggleFundStatusWithConfirm = async (fund) => {
    const currentStatusText = fund.status === 'OPEN' ? '開放' : '關閉';
    const newStatusText = fund.status === 'OPEN' ? '關閉' : '開放';

    const confirmed = confirm(`確定要將基金「${fund.fundName}」的狀態從「${currentStatusText}」改為「${newStatusText}」嗎？`);

    if (confirmed) {
        await toggleFundStatus(fund);
    }
};
</script>

<style scoped>
.fund-management-container {
    padding: 24px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* 一鍵輸入區域樣式 */
.quick-fill-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    border: 2px dashed #dee2e6;
}

.quick-fill-title {
    color: #495057;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.quick-fill-title i {
    color: #667eea;
}

.quick-fill-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}

.quick-fill-btn {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
}

.quick-fill-btn:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.template-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
}

.template-info {
    flex: 1;
}

.template-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 16px;
    margin-bottom: 4px;
}

.template-desc {
    font-size: 14px;
    color: #6c757d;
}

/* 頁面標題 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-content i {
    color: #667eea;
}

.page-subtitle {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
}

.add-fund-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.add-fund-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

/* 統計卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-icon.total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.closed {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.stat-content h3 {
    font-size: 14px;
    color: #6c757d;
    margin: 0 0 8px 0;
    font-weight: 500;
}

.stat-content p {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
}

/* 搜尋區 */
.search-bar {
    margin-bottom: 24px;
}

.search-box {
    position: relative;
    max-width: 400px;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 14px;
    background: white;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 表格容器 */
.table-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-header {
    padding: 24px 32px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.table-actions {
    display: flex;
    gap: 12px;
}

.refresh-btn {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
    background: #138496;
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.table-wrapper {
    overflow-x: auto;
}

.fund-table {
    width: 100%;
    border-collapse: collapse;
}

.fund-table th {
    background: #f8f9fa;
    padding: 16px 12px;
    text-align: center;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    font-size: 14px;
    white-space: nowrap;
}

.fund-table td {
    padding: 16px 12px;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
    vertical-align: middle;
}

.table-row {
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: #f8f9fa;
}

/* 表格內容樣式 */
.fund-code {
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    font-weight: 600;
}

.fund-name {
    font-weight: 600;
    color: #2c3e50;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-value {
    font-weight: 600;
    color: #28a745;
}

.nav-date {
    color: #6c757d;
    font-size: 12px;
}

.risk-level {
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    color: white;
}

.risk-1 {
    background: #28a745;
}

.risk-2 {
    background: #17a2b8;
}

.risk-3 {
    background: #ffc107;
    color: #212529;
}

.risk-4 {
    background: #fd7e14;
}

.risk-5 {
    background: #dc3545;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.status-badge.open {
    background: #d4edda;
    color: #155724;
}

.status-badge.closed {
    background: #f8d7da;
    color: #721c24;
}

/* 操作按鈕 */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 12px;
}

.edit-btn {
    background: #28a745;
    color: white;
}

.edit-btn:hover {
    background: #218838;
    transform: translateY(-1px);
}

/* 空狀態 */
.empty-state {
    text-align: center;
    padding: 48px 24px;
    color: #6c757d;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    color: #dee2e6;
}

.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
}

.empty-subtitle {
    font-size: 14px;
    color: #6c757d;
}

/* 彈窗樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 32px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.modal-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.close-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: #e9ecef;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #dc3545;
    color: white;
}

.modal-body {
    padding: 32px;
    overflow-y: auto;
    flex: 1;
}

.fund-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.form-group label i {
    color: #667eea;
    width: 16px;
}

.required {
    color: #dc3545;
}

.form-group input,
.form-group select {
    padding: 12px 16px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    background: white;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
}

.modal-footer {
    padding: 24px 32px;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    background: #f8f9fa;
}

.btn-cancel,
.btn-save {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.btn-cancel {
    background: #6c757d;
    color: white;
}

.btn-cancel:hover {
    background: #5a6268;
}

.btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 載入遮罩 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-overlay p {
    color: #6c757d;
    font-weight: 600;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .fund-management-container {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        padding: 24px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .search-box {
        max-width: none;
    }

    .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .table-actions {
        justify-content: flex-end;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .modal-container {
        width: 95%;
        margin: 16px;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 20px;
    }

    .fund-table th,
    .fund-table td {
        padding: 8px 6px;
        font-size: 12px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 4px;
    }

    .quick-fill-buttons {
        grid-template-columns: 1fr;
    }

    .quick-fill-section {
        padding: 16px;
    }
}

@media (max-width: 480px) {
    .header-content h2 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
    }

    .table-wrapper {
        font-size: 12px;
    }

    .fund-name {
        max-width: 120px;
    }

    .stat-content p {
        font-size: 24px;
    }

    .template-icon {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .template-name {
        font-size: 14px;
    }

    .template-desc {
        font-size: 12px;
    }
}
</style>