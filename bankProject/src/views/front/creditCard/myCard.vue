<template>
  <v-container class="py-8 mx-auto" style="max-width: 1100px;">
    <div class="d-flex align-center mb-4">
      <div class="text-h5 font-weight-bold">我的信用卡</div>
      <v-spacer />
      <v-btn variant="text" prepend-icon="mdi-refresh" :loading="loading" @click="fetchCards">
        重新整理
      </v-btn>
    </div>

    <v-alert v-if="pageError" type="error" variant="tonal" class="mb-4">{{ pageError }}</v-alert>

    <v-empty-state
      v-if="!loading && cards.length === 0"
      headline="目前沒有可顯示的信用卡"
      icon="mdi-credit-card-outline"
      class="my-12"
    />

    <v-row v-else class="ga-6" justify="center">
      <v-col v-for="c in cards" :key="c.cardId" cols="12" md="10">
        <v-card class="rounded-2xl elevation-3">
          <!-- 卡面圖 -->
          <div class="pa-4 pb-0 d-flex align-center">
            <v-img
              :src="cardImage(c)"
              :alt="`${c.cardType?.typeName || ''} 卡面`"
              class="rounded-xl bg-grey-lighten-4"
              height="160"
              contain
            />
          </div>

          <v-card-text>
            <!-- 卡名 & 末四碼 -->
            <div class="d-flex align-center mt-2">
              <div class="text-h6">
                {{ c.cardType?.typeName || '信用卡' }}
                <span class="text-medium-emphasis text-subtitle-2 ml-1">｜末四碼 {{ last4(c.cardCode) }}</span>
              </div>
              <v-spacer />
              <v-chip :color="statusColor(c.status)" size="small" variant="flat">
                {{ statusText(c.status) }}
              </v-chip>
            </div>

            <v-divider class="my-3" />

            <!-- 主要資訊 -->
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">卡別 / 類型</div>
                <div class="text-body-1">
                  {{ c.cardType?.typeName || '—' }}
                  <span v-if="c.cardType?.typeCode" class="text-medium-emphasis">（{{ c.cardType.typeCode }}）</span>
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">發卡日</div>
                <div class="text-body-1">{{ fmtDate(c.issuedDate) || '—' }}</div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">到期日</div>
                <div class="text-body-1">{{ fmtYm(c.expirationDate) || '—' }}</div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">卡片安全碼</div>
                <div class="text-body-1">{{ maskCvv(c.cvvCode) }}</div>
              </v-col>
            </v-row>

            <v-row class="mt-1">
              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">信用額度</div>
                <div class="text-body-1">{{ money(c.creditLimit) }}</div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">已用額度</div>
                <div class="text-body-1">{{ money(c.currentBalance) }}</div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">可用額度</div>
                <div class="text-body-1">{{ money(available(c)) }}</div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-caption text-medium-emphasis">卡片狀態</div>
                <div class="text-body-1">{{ statusText(c.status) }}</div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <!-- 動作 -->
          <v-card-actions class="pa-4">
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
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

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

/* 自動配對卡面圖（把 /src/image/creditCard/* 全抓進來） */
const cardImages = import.meta.glob('@/image/creditCard/*', { eager: true, as: 'url' })

/* 常用備援圖 */
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

/* 確認窗 */
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
  } catch (e) {
    console.error(e)
    pageError.value = e.message || '載入失敗'
    cards.value = []
  } finally {
    loading.value = false
  }
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
    cardType: raw.cardType || null,  // { typeCode, typeName, ... }
  }
}

/* 卡面圖決策：先用 type_code 檔名比對，其次用 typeName 關鍵字，最後給預設圖 */
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

/* 顯示工具 */
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
const maskCvv = s => s ? '•••' : '—'

/* 變更狀態：先跳確認窗 */
function confirmChange(card, action) {
  confirm.value = {
    open: true,
    card,
    action,
    title: action === 'active' ? '確認開卡' : action === 'suspend' ? '確認停卡' : '確認變更',
    text: action === 'active'
      ? `確定要為「${card.cardType?.typeName || '信用卡'}（末四碼 ${last4(card.cardCode)}）」進行開卡嗎？`
      : `確定要將「${card.cardType?.typeName || '信用卡'}（末四碼 ${last4(card.cardCode)}）」停卡嗎？`,
    color: action === 'suspend' ? 'error' : 'primary',
  }
}

/* 送出變更 */
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
/* 需要可再微調樣式 */
</style>
