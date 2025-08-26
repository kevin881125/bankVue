<template>
  <v-container class="py-8 mx-auto" style="max-width: 1200px; height: 700px;">
    <div class="d-flex align-center mb-4">
      <div class="text-h5 font-weight-bold">我的信用卡申請紀錄</div>
      <v-spacer />
      <v-btn prepend-icon="mdi-refresh" variant="text" @click="fetchRecords" :loading="loading">
        重新整理
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

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
      class="rounded-2xl elevation-2"
      no-data-text="目前沒有申請紀錄"
      :items-per-page="10"
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

      <!-- 檔案按鈕：改成「點擊預覽 Dialog」 -->
      <template #item.files="{ item }">
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-if="item.idPhotoFront"
            size="small"
            variant="tonal"
            prepend-icon="mdi-eye"
            @click="openPreview(item.idPhotoFront, '身分證正面')"
          >正面</v-btn>

          <v-btn
            v-if="item.idPhotoBack"
            size="small"
            variant="tonal"
            prepend-icon="mdi-eye-outline"
            @click="openPreview(item.idPhotoBack, '身分證反面')"
          >反面</v-btn>

          <v-btn
            v-if="item.financialProof"
            size="small"
            variant="tonal"
            prepend-icon="mdi-eye"
            @click="openPreview(item.financialProof, '財力證明')"
          >財力</v-btn>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn size="small" variant="text" icon="mdi-content-copy" @click="copyId(item.applicationId)" />
      </template>
    </v-data-table>

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
          <!-- 圖片預覽 -->
          <div v-if="preview.kind === 'image'" class="pa-4">
            <v-img :src="preview.url" :alt="preview.title" class="rounded-lg bg-grey-lighten-4"
                   max-height="72vh" contain />
          </div>

          <!-- PDF 預覽（iframe） -->
          <div v-else-if="preview.kind === 'pdf'" class="pa-4">
            <iframe :src="pdfViewerUrl(preview.url)" style="width:100%; height:72vh; border:0;" />
          </div>

          <!-- 其他類型（僅提供下載） -->
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMemberStore } from '@/stores/MemberStore'

const memberStore = useMemberStore()

/** 後端位址與 context path（依環境調整） */
const BACKEND_ORIGIN = 'http://localhost:8080'
const BACKEND_BASE   = '/bank'

/** 把相對路徑補成 http://localhost:8080/bank/xxx */
function absUrl(u) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  const path = u.replace(/^\/+/, '')
  return `${BACKEND_ORIGIN}${BACKEND_BASE}/${path}`
}

/** 檔案預覽狀態 */
const preview = ref({
  open: false,
  url: '',
  title: '',
  kind: 'unknown', // image | pdf | unknown
})

function isImageUrl(u) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(u || '')
}
function isPdfUrl(u) {
  return /\.pdf$/i.test(u || '')
}
function pdfViewerUrl(u) {
  // 可加 viewer 參數（不同瀏覽器支援度略有差異）
  return `${u}#toolbar=1&navpanes=0`
}

function openPreview(rawUrl, title) {
  const url = absUrl(rawUrl)
  const kind = isImageUrl(url) ? 'image' : isPdfUrl(url) ? 'pdf' : 'unknown'
  preview.value = { open: true, url, title, kind }
}

const headers = [
  { title: '申請編號', key: 'applicationId', width: 120 },
  { title: '卡別', key: 'cardType', width: 120 },
  { title: '申請日期', key: 'applyDate', width: 160 },
  { title: '狀態', key: 'status', width: 140 },
  { title: '檔案', key: 'files', sortable: false, width: 200 },
  { title: '操作', key: 'actions', sortable: false, width: 100 },
]

const loading = ref(false)
const error = ref('')
const search = ref('')
const rows = ref([])
const cardTypeMap = ref({})
const toast = ref({ open: false, msg: '' })

function getToken() {
  return (
    memberStore?.token ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('jwt') ||
    ''
  )
}

async function fetchRecords() {
  error.value = ''
  loading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${BACKEND_ORIGIN}${BACKEND_BASE}/card/record`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || data?.message || `載入失敗 (${res.status})`)

    const apps = Array.isArray(data?.applications) ? data.applications : []
    cardTypeMap.value = data?.cardTypeNames || {}

    rows.value = apps.map(a => ({
      applicationId: a.applicationId,
      userId: a.userId,
      cardType: a.cardType,
      idPhotoFront: a.idPhotoFront,
      idPhotoBack: a.idPhotoBack,
      financialProof: a.financialProof,
      applyDate: a.applyDate,
      status: a.status,
    }))
  } catch (e) {
    console.error(e)
    error.value = e.message || '載入失敗'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function cardName(cardTypeId) {
  const code = cardTypeMap.value?.[cardTypeId]
  if (code) return code
  const fallback = { 1: '白金卡', 2: '御璽卡', 3: '無限卡' }
  return fallback[cardTypeId] || `卡別#${cardTypeId}`
}

function displayStatus(s) {
  const map = { PENDING: '審核中', APPROVED: '核准', REJECTED: '駁回' }
  return map[s] || s || '—'
}
function statusColor(s) {
  const m = { 審核中: 'amber', 核准: 'green', 駁回: 'red' }
  return m[s] || 'grey'
}

function fmtDate(v) {
  if (!v) return ''
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.replace('T', ' ').slice(0, 16)
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function copyId(id) {
  try {
    await navigator.clipboard.writeText(String(id))
    toast.value = { open: true, msg: '已複製申請編號' }
  } catch {
    toast.value = { open: true, msg: '複製失敗' }
  }
}

onMounted(fetchRecords)
</script>

<style scoped>
/* 依需要調整 Dialog 內高寬 */
</style>
