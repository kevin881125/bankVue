<template>
  <v-container class="py-8 mx-auto" style="max-width: 1200px;">
    <div class="text-h4 font-weight-bold mb-6">精選卡片</div>

    <v-alert v-if="pageError" type="error" variant="tonal" class="mb-4">{{ pageError }}</v-alert>

    <v-row justify="center" class="ga-6">
      <v-col v-for="card in cards" :key="card.cardTypeId" cols="12" sm="6" md="3">
        <v-card class="rounded-2xl" elevation="6">
          <v-img :src="card.img" height="160" contain class="rounded-t-2xl bg-grey-lighten-4" />
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div class="text-h6">{{ card.name }}</div>
              <v-chip size="small" variant="flat">{{ card.tag }}</v-chip>
            </div>
          </v-card-item>
          <v-card-text class="pt-0">
            <ul class="text-body-2 text-medium-emphasis pl-4">
              <li v-for="(h, i) in card.highlights" :key="i">{{ h }}</li>
            </ul>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn color="primary" block @click="openApply(card)">立即申請</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div class="mt-10 text-caption text-medium-emphasis">
      ※ 圖片僅示意，實際卡面以核發為準。
    </div>

    <!-- 申請對話框 -->
    <v-dialog v-model="applyOpen" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-img v-if="selected.img" :src="selected.img" height="56" width="96" contain class="mr-4" />
          <div>
            <div class="text-overline">已選卡別</div>
            <div class="text-h6">{{ selected.cardName }}（ID：{{ selected.cardTypeId }}）</div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeApply" />
        </v-card-title>

        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
            申請成功，編號：{{ successId }}
          </v-alert>

          <v-form @submit.prevent="onSubmit">
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-text-field v-model="selected.cardTypeId" label="卡別 ID" readonly />
              </v-col>
              <v-col cols="12" sm="8">
                <v-text-field v-model="selected.cardName" label="卡別名稱" readonly />
              </v-col>

              <v-col cols="12" sm="4">
                <v-file-input
                  v-model="files.idFront"
                  label="身分證正面"
                  accept="image/*,application/pdf"
                  prepend-icon="mdi-file-upload"
                  :rules="[required]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-file-input
                  v-model="files.idBack"
                  label="身分證反面"
                  accept="image/*,application/pdf"
                  prepend-icon="mdi-file-upload"
                  :rules="[required]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-file-input
                  v-model="files.financialProof"
                  label="財力證明"
                  accept="image/*,application/pdf"
                  prepend-icon="mdi-file-upload"
                  :rules="[required]"
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn class="mr-2" variant="text" @click="closeApply">取消</v-btn>
              <v-btn :loading="loading" color="primary" type="submit">送出申請</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.open" :timeout="2500">{{ toast.msg }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useMemberStore } from '@/stores/MemberStore'

const memberStore = useMemberStore()

// 本地圖片
const imgVisa     = new URL('@/image/creditCard/visa.jpg', import.meta.url).href
const imgJcb      = new URL('@/image/creditCard/jcb.png', import.meta.url).href
const imgInfinite = new URL('@/image/creditCard/infiniteVisa.jpg', import.meta.url).href

// 展示資料（先前端常數）
const cards = ref([
  { cardTypeId: 1, name: '白金卡', tag: '人氣入門', img: imgVisa,     highlights: ['日常回饋', '基本權益完整', '核卡門檻友善'] },
  { cardTypeId: 2, name: '御璽卡', tag: '旅遊首選', img: imgJcb,      highlights: ['旅遊/海外通路加碼', '機場接送/保險', '權益均衡升級'] },
  { cardTypeId: 3, name: '無限卡', tag: '高端尊榮', img: imgInfinite,  highlights: ['高額度/高回饋', '機場貴賓/頂級禮遇', '高端權益最完整'] },
])

const pageError = ref('')

// Dialog 狀態
const applyOpen = ref(false)
const selected = ref({ cardTypeId: '', cardName: '', img: '' })

// 表單
const files = ref({ idFront: null, idBack: null, financialProof: null })
const loading = ref(false)
const error = ref('')
const success = ref(false)
const successId = ref('')
const toast = ref({ open: false, msg: '' })

function required(v) { return !!v || '此欄位必填' }

function openApply(card) {
  error.value = ''
  success.value = false
  successId.value = ''
  files.value = { idFront: null, idBack: null, financialProof: null }
  selected.value = {
    cardTypeId: String(card.cardTypeId),
    cardName: card.name,
    img: card.img,
  }
  applyOpen.value = true
}

function closeApply() {
  applyOpen.value = false
}

function getToken() {
  return (
    memberStore?.token ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('jwt') ||
    ''
  )
}

async function onSubmit() {
  error.value = ''
  success.value = false

  if (!files.value.idFront || !files.value.idBack || !files.value.financialProof) {
    error.value = '請上傳所有必要檔案'
    return
  }

  // v-file-input 可能回傳 File 或 File[]（多選時），統一取第一個
  const pick = (f) => Array.isArray(f) ? f[0] : f

  const fd = new FormData()
  fd.append('cardType', selected.value.cardTypeId)
  fd.append('idFront', pick(files.value.idFront))
  fd.append('idBack', pick(files.value.idBack))
  fd.append('financialProof', pick(files.value.financialProof))

  const token = getToken()

  try {
    loading.value = true

    // 改用 fetch 直呼後端，不動共用 util；瀏覽器自動帶 multipart boundary
    const res = await fetch('http://localhost:8080/bank/card/submit', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || `申請失敗 (${res.status})`)

    success.value = true
    successId.value = data.applicationId
    toast.value = { open: true, msg: '申請已送出' }
    // setTimeout(() => (applyOpen.value = false), 1200)
  } catch (e) {
    error.value = e.message || '申請失敗'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ul { margin: 0; }
</style>
