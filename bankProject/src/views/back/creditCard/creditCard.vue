<template>
  <v-container class="py-8 credit-admin">
    <!-- Hero / 標題列 -->
    <v-sheet class="hero rounded-xl pa-8 elevation-1">
      <div class="d-flex align-center">
        <v-avatar size="56" class="brand-avatar mr-4">
          <v-icon size="34">mdi-credit-card-outline</v-icon>
        </v-avatar>
        <div>
          <div class="text-h5 font-weight-bold">信用卡管理</div>
          <div class="text-medium-emphasis">審核、交易、帳單、繳費，一站完成</div>
        </div>
        <v-spacer />
        <v-chip variant="flat" color="primary" class="d-none d-sm-inline-flex">後台</v-chip>
      </div>
    </v-sheet>

    <!-- 功能卡片 -->
    <v-row class="mt-6" align="stretch">
      <v-col cols="12" sm="6" md="3">
        <v-card class="action-card rounded-xl" to="/yuzubank/backmain/creditCard/review" tag="router-link" hover>
          <v-card-text class="text-center py-8">
            <div class="accent accent--blue mx-auto mb-4">
              <v-icon size="34">mdi-credit-card-check-outline</v-icon>
            </div>
            <div class="text-subtitle-1 title mb-1">審核信用卡</div>
            <div class="text-medium-emphasis text-body-2">審件、核發、狀態調整</div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn color="primary" variant="flat" rounded="lg" append-icon="mdi-arrow-right">前往</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="action-card rounded-xl" to="/yuzubank/backmain/creditCard/transaction" tag="router-link" hover>
          <v-card-text class="text-center py-8">
            <div class="accent accent--green mx-auto mb-4">
              <v-icon size="34">mdi-swap-horizontal</v-icon>
            </div>
            <div class="text-subtitle-1 title mb-1">交易管理</div>
            <div class="text-medium-emphasis text-body-2">查詢、退款、異常處理</div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn color="primary" variant="flat" rounded="lg" append-icon="mdi-arrow-right">前往</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="action-card rounded-xl" to="/yuzubank/backmain/creditCard/bill" tag="router-link" hover>
          <v-card-text class="text-center py-8">
            <div class="accent accent--purple mx-auto mb-4">
              <v-icon size="34">mdi-file-document-outline</v-icon>
            </div>
            <div class="text-subtitle-1 title mb-1">帳單管理</div>
            <div class="text-medium-emphasis text-body-2">出帳、調整、狀態</div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn color="primary" variant="flat" rounded="lg" append-icon="mdi-arrow-right">前往</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="action-card rounded-xl" to="/yuzubank/backmain/creditCard/cardPayment" tag="router-link" hover>
          <v-card-text class="text-center py-8">
            <div class="accent accent--amber mx-auto mb-4">
              <v-icon size="34">mdi-cash-check</v-icon>
            </div>
            <div class="text-subtitle-1 title mb-1">繳費管理</div>
            <div class="text-medium-emphasis text-body-2">入帳、折抵、對帳</div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn color="primary" variant="flat" rounded="lg" append-icon="mdi-arrow-right">前往</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// 無邏輯需求可留空
</script>

<style scoped>
.credit-admin {
  max-width: 1100px;
  margin-inline: auto;
}

/* Hero 區塊：淡淡的漸層 + 玻璃感 */
.hero {
  background: linear-gradient(135deg, #f6f8ff 0%, #ffffff 60%);
  border: 1px solid #eef1ff;
}
.brand-avatar {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

/* 功能卡片：玻璃擬態、柔和陰影、浮起效果 */
.action-card {
  position: relative;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 24px rgba(20, 40, 80, 0.06);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  backdrop-filter: blur(6px);
}
.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(20, 40, 80, 0.12);
  border-color: rgba(0, 0, 0, 0.08);
}
.title { font-weight: 600; }

/* 彩色圖示膠囊 */
.accent {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.accent--blue   { background: #eef4ff; color: #3b82f6; }
.accent--green  { background: #e8fbf2; color: #10b981; }
.accent--purple { background: #f4e9ff; color: #a855f7; }
.accent--amber  { background: #fff6e6; color: #f59e0b; }
</style>
