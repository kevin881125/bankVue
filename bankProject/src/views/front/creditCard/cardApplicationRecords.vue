<template>
  <v-container class="py-8 mx-auto" style="max-width: 1200px;">
    <div class="d-flex align-center mb-4">
      <div class="text-h5 font-weight-bold">我的信用卡申請紀錄</div>
      <v-spacer />
      <v-btn prepend-icon="mdi-refresh" variant="text" @click="fetchRecords" :loading="loading">
        重新整理
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-card class="soft-card pa-4">
    <v-text-field
      v-model="search"
      density="comfortable"
      prepend-inner-icon="mdi-magnify"
      label="搜尋（編號、卡別、狀態）"
      class="mb-4"
      clearable
    />

    <v-data-table
      :headers="headers"
      :items="rows"
      :search="search"
      :loading="loading"
      item-key="applicationId"
      class="my-record-table"
      no-data-text="目前沒有申請紀錄"
      :items-per-page="10"
      density="comfortable"
      :row-props="() => ({ class: 'my-row' })"
    >
      <template #item.cardType="{ item }">
        <v-chip size="small" variant="flat">{{ cardName(item.cardType) }}</v-chip>
      </template>

      <template #item.applyDate="{ item }">
        {{ fmtDate(item.applyDate) }}
      </template>

      <template #item.status="{ item }">
        <v-chip :color="statusColor(displayStatus(item.status))" size="small" variant="flat">
          {{ displayStatus(item.status) }}
        </v-chip>
      </template>

      <!-- 檔案：以 chip 呈現，固定單行、不換行 -->
      <template #item.files="{ item }">
        <div class="file-line">
          <v-chip
            v-if="item.idPhotoFront"
            size="small"
            variant="tonal"
            class="file-chip"
            @click="openPreview(item.idPhotoFront, '身分證正面')"
          >
            正面
          </v-chip>

          <v-chip
            v-if="item.idPhotoBack"
            size="small"
            variant="tonal"
            class="file-chip"
            @click="openPreview(item.idPhotoBack, '身分證反面')"
          >
            反面
          </v-chip>

          <v-chip
            v-if="item.financialProof"
            size="small"
            variant="tonal"
            class="file-chip"
            @click="openPreview(item.financialProof, '財力證明')"
          >
            財力
          </v-chip>
        </div>
      </template>

      <!-- 備註：改成按鈕，按下開視窗顯示完整訊息 -->
      <template #item.reviewComment="{ item }">
        <template v-if="String(item.status).toUpperCase() === 'REJECTED' && item.reviewComment">
          <v-btn
            size="small"
            color="red"
            variant="tonal"
            @click="openReason(item.reviewComment)"
          >
            駁回原因
          </v-btn>
        </template>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
    </v-data-table>
    </v-card>

    <v-alert v-if="!loading && rows.length === 0" type="info" variant="tonal" class="mt-4">
      目前沒有申請紀錄。您可以前往
      <router-link to="/yuzubank/cards">信用卡精選頁</router-link>
      立即申請。
    </v-alert>

    <v-snackbar v-model="toast.open" :timeout="2000">{{ toast.msg }}</v-snackbar>

    <!-- 檔案預覽 Dialog -->
    <v-dialog v-model="preview.open" max-width="980">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-file-eye</v-icon>
          <span class="text-subtitle-1">{{ preview.title }}</span>
          <v-spacer />
          <v-btn
            v-if="preview.url"
            :href="preview.url"
            target="_blank"
            rel="noopener"
            variant="text"
            prepend-icon="mdi-download"
          >下載原檔</v-btn>
          <v-btn icon="mdi-close" variant="text" @click="preview.open = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">
          <div v-if="preview.kind === 'image'" class="pa-4">
            <v-img :src="preview.url" :alt="preview.title" class="rounded-lg bg-grey-lighten-4"
                   max-height="72vh" contain />
          </div>

          <div v-else-if="preview.kind === 'pdf'" class="pa-4">
            <iframe :src="pdfViewerUrl(preview.url)" style="width:100%; height:72vh; border:0;" />
          </div>

          <div v-else class="pa-6 text-center">
            <v-icon size="40" class="mb-2">mdi-file</v-icon>
            <div class="text-body-2 mb-4">此檔案格式不支援線上預覽，請下載檢視。</div>
            <v-btn :href="preview.url" target="_blank" rel="noopener" color="primary" prepend-icon="mdi-download">
              下載檔案
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 駁回原因 Dialog -->
    <v-dialog v-model="reason.open" max-width="560">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="red">mdi-alert-circle</v-icon>
          駁回原因
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="reason.open = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="py-6 px-6">
          <div class="text-body-1" style="white-space: pre-wrap;">{{ reason.text }}</div>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn color="primary" @click="reason.open = false">了解</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMemberStore } from '@/stores/MemberStore'

const memberStore = useMemberStore()

const BACKEND_ORIGIN = 'http://localhost:8080'
const BACKEND_BASE   = '/bank'

/* 檔案預覽 */
const preview = ref({ open: false, url: '', title: '', kind: 'unknown' })
function isImageUrl(u){ return /\.(png|jpe?g|gif|webp|bmp)$/i.test(u || '') }
function isPdfUrl(u){ return /\.pdf$/i.test(u || '') }
function pdfViewerUrl(u){ return `${u}#toolbar=1&navpanes=0` }
function absUrl(u){
  if(!u) return ''
  if(/^https?:\/\//i.test(u)) return u
  return `${BACKEND_ORIGIN}${BACKEND_BASE}/${String(u).replace(/^\/+/, '')}`
}
function openPreview(rawUrl, title){
  const url  = absUrl(rawUrl)
  const kind = isImageUrl(url) ? 'image' : isPdfUrl(url) ? 'pdf' : 'unknown'
  preview.value = { open: true, url, title, kind }
}

/* 駁回原因 Dialog */
const reason = ref({ open:false, text:'' })
function openReason(text){
  reason.value = { open: true, text: text || '' }
}

/* 表頭 */
const headers = [
  { title: '申請編號', key: 'applicationId', width: 120 },
  { title: '卡別', key: 'cardType', width: 120 },
  { title: '申請日期', key: 'applyDate', width: 140 },
  { title: '狀態', key: 'status', width: 130 },
  { title: '檔案', key: 'files', sortable: false, width: 190 },                // ← 單行 chip，給足寬
  { title: '備註（駁回原因）', key: 'reviewComment', sortable: false, width: 140 }
]

const loading = ref(false)
const error   = ref('')
const search  = ref('')
const rows    = ref([])
const cardTypeMap = ref({})
const toast   = ref({ open:false, msg:'' })

function getToken(){
  return memberStore?.token || localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || ''
}

async function fetchRecords(){
  error.value = ''
  loading.value = true
  try{
    const token = getToken()
    const res = await fetch(`${BACKEND_ORIGIN}${BACKEND_BASE}/card/record`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(()=> ({}))
    if(!res.ok) throw new Error(data?.error || data?.message || `載入失敗 (${res.status})`)

    const apps = Array.isArray(data?.applications) ? data.applications : []
    cardTypeMap.value = data?.cardTypeNames || {}

    rows.value = apps.map(a => ({
      applicationId : a.applicationId,
      userId        : a.userId,
      cardType      : a.cardType,
      idPhotoFront  : a.idPhotoFront,
      idPhotoBack   : a.idPhotoBack,
      financialProof: a.financialProof,
      applyDate     : a.applyDate,
      reviewDate    : a.reviewDate,
      status        : a.status,
      reviewComment : a.reviewComment
    }))
  }catch(e){
    console.error(e)
    error.value = e.message || '載入失敗'
    rows.value = []
  }finally{
    loading.value = false
  }
}

function cardName(cardTypeId){
  const hit = cardTypeMap.value?.[cardTypeId]
  if(hit) return hit
  const fallback = { 1:'白金卡', 2:'御璽卡', 3:'無限卡' }
  return fallback[cardTypeId] || `卡別#${cardTypeId}`
}

function displayStatus(s){
  const U = String(s || '').toUpperCase()
  const map = { PENDING:'審核中', APPROVED:'核准', ISSUED:'核卡完成', REJECTED:'駁回' }
  return map[U] || s || '—'
}
function statusColor(label){
  const m = { 審核中:'amber', 核准:'green', 核卡完成:'green', 駁回:'red' }
  return m[label] || 'grey'
}

function fmtDate(v){
  if(!v) return ''
  if(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0,10)
  const d = new Date(v)
  if(Number.isNaN(d.getTime())) return String(v)
  const p = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

onMounted(fetchRecords)
</script>

<style scoped>
/* 固定檔案區為單行、等距、不可換行 */
.file-line{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;      /* 不換行 */
}
.file-chip{
  padding-inline: 8px;
  min-width: 44px;          /* 小而清楚 */
  cursor: pointer;
}
/* 柔和卡片（與 myBill 同款） */
:deep(.soft-card) {
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08) !important;
  background: #fff;
  overflow: hidden;
}

/* 表格：行距更鬆、圓角與陰影由外層卡片負責 */
:deep(.my-record-table .my-row) {
  height: 60px; /* 想更鬆可 64/68/72 */
}
:deep(.my-record-table .my-row > td) {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  font-size: 15px;
}
/* 表頭也微放鬆（可選） */
:deep(.my-record-table thead th) {
  padding-top: 14px;
  padding-bottom: 14px;
}

/* 統一搜尋欄/下拉/按鈕的圓角（與頁面風格一致） */
:deep(.rounded-input),
:deep(.v-input .v-field),
:deep(.v-select .v-field),
:deep(.v-btn) {
  border-radius: 12px !important;   /* 想完全呼應卡片可改 20px */
}

/* 讓 tonal/outlined 欄位邊界更柔和（可選） */
:deep(.v-field) {
  border-width: 1px;
}

/* 檔案 chip 列：單行與間距（沿用你原有設定） */
.file-line{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.file-chip{
  padding-inline: 8px;
  min-width: 44px;
  cursor: pointer;
}

</style>
