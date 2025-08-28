<template>
  <v-container class="py-8 mx-auto" style="max-width: 900px;">
    <div class="d-flex align-center mb-4">
      <div class="text-h5 font-weight-bold">我的信用卡</div>
      <v-spacer />
      <div class="text-caption mr-4" v-if="cards.length">
        {{ currentIndex + 1 }} / {{ cards.length }}
      </div>
      <v-btn
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="fetchCards"
        :disabled="loading"
      >
        重新整理
      </v-btn>
    </div>

    <v-alert v-if="pageError" type="error" variant="tonal" class="mb-4">
      {{ pageError }}
    </v-alert>

    <v-empty-state
      v-if="!loading && cards.length === 0"
      headline="目前沒有可顯示的信用卡"
      icon="mdi-credit-card-outline"
      class="my-12"
    />

    <!-- 單張顯示/可滑動切換 -->
    <v-window
      v-else
      v-model="currentIndex"
      show-arrows="hover"
      class="soft-window"
      continuous
      touch
    >
      <v-window-item v-for="c in cards" :key="c.cardId">
        <v-card class="soft-card">
          <!-- 卡面 -->
          <div class="card-hero d-flex align-center justify-center">
            <v-img
              :src="cardImage(c)"
              :alt="`${c.cardType?.typeName || ''} 卡面`"
              height="180"
              class="rounded-xl"
              contain
              style="max-width: 520px;"
            />
          </div>

          <v-card-text class="card-body">
            <!-- 標題列 -->
            <div class="d-flex align-center">
              <div class="text-h6">
                {{ c.cardType?.typeName || '信用卡' }}
                <span class="text-medium-emphasis text-subtitle-2 ml-1">
                  ｜末四碼 {{ last4(c.cardCode) }}
                </span>
              </div>
              <v-spacer />
              <v-chip :color="statusColor(c.status)" size="small" variant="flat">
                {{ statusText(c.status) }}
              </v-chip>
            </div>

            <v-divider class="my-3" />

            <!-- 主資訊 -->
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">卡別 / 類型</div>
                <div class="text-body-1">
                  {{ c.cardType?.typeName || '—' }}
                  <span v-if="c.cardType?.typeCode" class="text-medium-emphasis">
                    （{{ c.cardType.typeCode }}）
                  </span>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">發卡日</div>
                <div class="text-body-1">{{ fmtDate(c.issuedDate) || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">到期日</div>
                <div class="text-body-1">{{ fmtYm(c.expirationDate) || '—' }}</div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">信用額度</div>
                <div class="text-body-1">{{ money(c.creditLimit) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">已用額度</div>
                <div class="text-body-1">{{ money(c.currentBalance) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">可用額度</div>
                <div class="text-body-1">{{ money(available(c)) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">卡片安全碼</div>
                <div class="text-body-1">{{ maskCvv(c.cvvCode) }}</div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis">可用紅利點數</div>
                    <div class="text-body-1">
                      <template v-if="pointsLoading[c.cardId]">
                        <v-progress-circular indeterminate size="16" class="mr-2" />
                        載入中…
                      </template>
                      <template v-else>
                        {{ pointsText(c.cardId) }}
                      </template>
                    </div>
                  </div>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :loading="pointsLoading[c.cardId]"
                    :disabled="pointsLoading[c.cardId]"
                    @click="refreshPoints(c.cardId)"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <!-- 動作 -->
          <v-card-actions class="card-actions">
            <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="prev" />
            <v-spacer />
            <template v-if="isInactive(c.status)">
              <v-btn color="primary" :loading="actingId === c.cardId" @click="confirmChange(c, 'active')">
                開卡
              </v-btn>
            </template>
            <template v-else-if="isActive(c.status)">
              <v-btn color="error" variant="tonal" :loading="actingId === c.cardId" @click="confirmChange(c, 'suspend')">
                停卡
              </v-btn>
            </template>
            <template v-else-if="isSuspend(c.status)">
              <v-btn color="primary" :loading="actingId === c.cardId" @click="confirmChange(c, 'active')">
                重新啟用
              </v-btn>
            </template>
            <v-spacer />
            <v-btn variant="text" append-icon="mdi-chevron-right" @click="next" />
          </v-card-actions>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- 點點導覽 -->
    <div v-if="cards.length" class="d-flex justify-center mt-3">
      <v-btn
        v-for="(c, i) in cards"
        :key="c.cardId"
        icon
        size="small"
        variant="text"
        :color="i === currentIndex ? 'primary' : 'grey'"
        @click="currentIndex = i"
        :aria-label="`切到第 ${i+1} 張`"
      >
        <v-icon>mdi-circle-small</v-icon>
      </v-btn>
    </div>

    <v-snackbar v-model="toast.open" :timeout="2200">{{ toast.msg }}</v-snackbar>

    <!-- 確認 Dialog -->
    <v-dialog v-model="confirm.open" max-width="420">
      <v-card class="rounded-xl">
        <v-card-title class="text-h6">{{ confirm.title }}</v-card-title>
        <v-card-text class="text-body-2">{{ confirm.text }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirm.open = false">取消</v-btn>
          <v-btn :color="confirm.color" :loading="actingId === confirm.card?.cardId" @click="doChange()">
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMemberStore } from '@/stores/MemberStore'

/** 後端位址與 context path（依環境調整） */
const BACKEND_ORIGIN = 'http://localhost:8080'
const BACKEND_BASE   = '/bank'

const memberStore = useMemberStore()

/* 自動配對卡面圖 */
const cardImages = import.meta.glob('@/image/creditCard/*', { eager: true, as: 'url' })
const imgVisa     = new URL('@/image/creditCard/visa.jpg', import.meta.url).href
const imgJcb      = new URL('@/image/creditCard/jcb.png', import.meta.url).href
const imgInfinite = new URL('@/image/creditCard/infiniteVisa.jpg', import.meta.url).href

/* 狀態工具 */
const isActive   = s => String(s).toLowerCase() === 'active'
const isInactive = s => String(s).toLowerCase() === 'inactive'
const isSuspend  = s => String(s).toLowerCase() === 'suspend'
const statusText = s => ({ active: '已開卡', inactive: '未開卡', suspend: '已停卡' }[String(s).toLowerCase()] || String(s))
const statusColor = s => ({ active: 'green', inactive: 'grey', suspend: 'amber' }[String(s).toLowerCase()] || 'grey')

/* 畫面狀態 */
const loading   = ref(false)
const pageError = ref('')
const cards     = ref([])
const actingId  = ref(null)
const toast     = ref({ open: false, msg: '' })
const currentIndex = ref(0) // 目前顯示哪一張

/* 紅利點數 */
const points = ref({})
const pointsLoading = ref({})
const pointsError = ref({})

const confirm = ref({ open: false, card: null, action: '', title: '', text: '', color: 'primary' })

function getToken() {
  return memberStore?.token || localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || ''
}

/* 取得卡片清單 */
async function fetchCards() {
  loading.value = true
  pageError.value = ''
  try {
    const token = getToken()
    const res = await fetch(`${BACKEND_ORIGIN}${BACKEND_BASE}/memberCard/getCard`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ([]))
    if (!res.ok) throw new Error(data?.error || data?.message || `載入失敗 (${res.status})`)

    cards.value = Array.isArray(data) ? data.map(mapCard) : []
    currentIndex.value = 0
    await Promise.all(cards.value.map(c => refreshPoints(c.cardId)))
  } catch (e) {
    console.error(e)
    pageError.value = e.message || '載入失敗'
    cards.value = []
    currentIndex.value = 0
  } finally {
    loading.value = false
  }
}

/* 單卡刷新紅利點數 */
async function refreshPoints(cardId) {
  pointsLoading.value = { ...pointsLoading.value, [cardId]: true }
  pointsError.value   = { ...pointsError.value,   [cardId]: '' }
  try {
    const token = getToken()
    const url = new URL(`${BACKEND_ORIGIN}${BACKEND_BASE}/reward/points`)
    url.searchParams.set('cardId', String(cardId))
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || data?.message || `點數查詢失敗 (${res.status})`)
    const val = Number(data?.points ?? 0)
    points.value = { ...points.value, [cardId]: Number.isFinite(val) ? val : 0 }
  } catch (e) {
    console.error(e)
    pointsError.value = { ...pointsError.value, [cardId]: e.message || '查詢失敗' }
    points.value = { ...points.value, [cardId]: 0 }
  } finally {
    pointsLoading.value = { ...pointsLoading.value, [cardId]: false }
  }
}

function pointsText(cardId) {
  if (pointsError.value[cardId]) return '—'
  const p = points.value[cardId]
  if (typeof p !== 'number' || Number.isNaN(p)) return '—'
  return `${p.toLocaleString()} 點`
}

/* 統一整理後端物件 */
function mapCard(raw) {
  return {
    cardId: raw.cardId ?? raw.cardDetailId ?? raw.id,
    cardCode: raw.cardCode || '',
    cvvCode: raw.cvvCode || '',
    issuedDate: raw.issuedDate || '',
    expirationDate: raw.expirationDate || '',
    creditLimit: raw.creditLimit ?? 0,
    currentBalance: raw.currentBalance ?? 0,
    status: raw.status || 'inactive',
    cardType: raw.cardType || null,
  }
}

/* 顯示工具 */
function cardImage(c) {
  const code = (c.cardType?.typeCode || '').toLowerCase().trim()
  if (code) {
    const hit = Object.entries(cardImages).find(([path]) =>
      path.toLowerCase().includes(`/creditcard/${code}.`)
    )
    if (hit) return hit[1]
  }
  const name = (c.cardType?.typeName || '').trim()
  if (name.includes('無限')) return imgInfinite
  if (code === 'jcb') return imgJcb
  return imgVisa
}

const money = v => `NT$${Number(v ?? 0).toLocaleString()}`
function fmtDate(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`
}
function fmtYm(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}`
}
const last4 = code => String(code || '').slice(-4).padStart(4, '•')
const available = c => Math.max(0, Number(c.creditLimit || 0) - Number(c.currentBalance || 0))
const maskCvv = s => (s ? '•••' : '—')

/* 切換 */
function next() {
  if (!cards.value.length) return
  currentIndex.value = (currentIndex.value + 1) % cards.value.length
}
function prev() {
  if (!cards.value.length) return
  currentIndex.value = (currentIndex.value - 1 + cards.value.length) % cards.value.length
}

/* 變更狀態 */
function confirmChange(card, action) {
  confirm.value = {
    open: true,
    card,
    action,
    title: action === 'active' ? '確認開卡' : action === 'suspend' ? '確認停卡' : '確認變更',
    text:
      action === 'active'
        ? `確定要為「${card.cardType?.typeName || '信用卡'}（末四碼 ${last4(card.cardCode)}）」進行開卡嗎？`
        : `確定要將「${card.cardType?.typeName || '信用卡'}（末四碼 ${last4(card.cardCode)}）」停卡嗎？`,
    color: action === 'suspend' ? 'error' : 'primary',
  }
}

async function doChange() {
  const card = confirm.value.card
  const action = confirm.value.action
  confirm.value.open = false
  if (!card || !action) return

  actingId.value = card.cardId
  try {
    const token = getToken()
    const body = new URLSearchParams()
    body.append('cardId', String(card.cardId))
    body.append('action', action)

    const res = await fetch(`${BACKEND_ORIGIN}${BACKEND_BASE}/memberCard/status`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `變更失敗 (${res.status})`)

    toast.value = { open: true, msg: '卡片狀態已更新' }
    await fetchCards()
  } catch (e) {
    console.error(e)
    toast.value = { open: true, msg: e.message || '卡片狀態更新失敗' }
  } finally {
    actingId.value = null
  }
}

onMounted(fetchCards)
</script>

<style scoped>
/* 與 myBill 同規格的卡片視覺 */
:deep(.soft-card) {
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08) !important;
  background: #fff;
  overflow: hidden; /* 讓圓角生效於內部 */
}

/* v-window 的外框也套同一套（讓整塊有圓角與陰影） */
:deep(.soft-window) {
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08) !important;
  background: transparent; /* 讓內部卡片白底即可 */
  overflow: hidden;
  padding: 0; /* 外框不需要內距 */
}

/* 內容與邊框距離：拉大卡片的內距 */
:deep(.soft-card .card-hero) {
  padding: 28px 28px 0 28px; /* 上左右 28、下 0 */
}
:deep(.soft-card .card-body) {
  padding: 20px 60px !important; /* 與卡邊距離更舒適 */
}
:deep(.soft-card .card-actions) {
  padding: 16px 24px !important;
}

/* 分隔線間距稍微放鬆 */
:deep(.soft-card .v-divider) {
  margin: 12px 0 !important;
}

/* 表頭標題與右上角 chip 的對齊間距（可選） */
:deep(.soft-card .text-h6) { line-height: 1.4; }

/* 若需要，讓 v-window 的箭頭在圓角內側對齊（可選） */
:deep(.soft-window .v-window__controls) {
  padding: 4px;
}

</style>
