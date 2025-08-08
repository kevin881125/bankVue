<template>
  <v-container>
    <h2 class="text-h5 mb-4">基金帳戶管理</h2>

    <!-- 查詢表單 -->
    <v-form @submit.prevent="getFundAccounts" class="d-flex align-center" ref="getForm">
      <v-select
        v-model="form.status"
        :items="statusOptions"
        label="帳戶狀態"
        class="me-4"
        style="max-width: 300px"
      />
      <v-text-field
        v-model="form.name"
        label="姓名"
        class="me-4"
        style="max-width: 300px"
      />
      <v-btn type="submit" color="primary">查詢</v-btn>
    </v-form>

    <!-- 新增表單 -->
    <v-form @submit.prevent="createAccount" class="d-flex align-center" ref="createForm">
      <v-text-field 
        v-model="form.memberId" 
        label="會員 ID" 
        type="number" 
        class="me-4"
        style="max-width: 300px"/>
      <v-select 
        v-model="form.riskType" 
        :items="riskOptions" 
        label="風險類型" 
        class="me-4"
        style="max-width: 300px"/>
      <v-btn type="submit" color="primary">新增</v-btn>
    </v-form>

    <!-- 資料表格 -->
    <v-data-table :headers="headers" :items="accounts" class="elevation-1">
      <template #item.actions="{ item }">
        <v-btn color="primary" @click="openGet(item.id)">查看</v-btn>
        <v-btn color="#EBB211" @click="openEdit(item)">修改</v-btn>
        <v-btn color="error" @click="remove(item.id)">刪除</v-btn>
      </template>
    </v-data-table>

    <!-- 單筆資料 Dialog -->
    <v-dialog v-model="getDialog"  max-width="500px">
      <v-card>
        <v-card-title>基金帳戶資料</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedAccount.memberId"
            label="會員ID"
            readonly/>
          <v-text-field
            v-model="selectedAccount.name"
            label="姓名"
            readonly/>
          <v-text-field
            v-model="selectedAccount.memberAccount"
            label="帳號"
            readonly/>
          <v-text-field
            v-model="selectedAccount.password"
            label="密碼"
            readonly/>
          <v-text-field
            v-model="selectedAccount.identity"
            label="身分證"
            readonly/>  
          <v-text-field
            v-model="selectedAccount.gender"
            label="性別"
            readonly/>
          <v-text-field
            v-model="selectedAccount.address"
            label="地址"
            readonly/>
          <v-text-field
            v-model="selectedAccount.phone"
            label="電話"
            readonly/>
          <v-text-field
            v-model="selectedAccount.birthday"
            label="生日"
            readonly/>
          <v-text-field
            v-model="selectedAccount.email"
            label="email"
            readonly/>
          <v-text-field
            v-model="selectedAccount.creation"
            label="註冊日期"
            readonly/>
          <v-text-field
            v-model="selectedAccount.memberStatus"
            label="會員狀態"
            readonly/>
          <v-text-field
            v-model="selectedAccount.accountId"
            label="帳戶帳號"
            readonly/>
          <v-text-field
            v-model="selectedAccount.balance"
            label="餘額"
            readonly/>
          <v-text-field
            v-model="selectedAccount.accountStatus"
            label="帳戶狀態"
            readonly/>
          <v-text-field
            v-model="selectedAccount.id"
            label="基金帳號"
            readonly/>
          <v-text-field
            v-model="selectedAccount.status"
            label="基金帳戶狀態"
            readonly/>
          <v-text-field
            v-model="selectedAccount.riskType"
            label="風險屬性"
            readonly/>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="getDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 編輯 Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>編輯基金帳戶</v-card-title>
        <v-card-text>
          <v-text-field v-model="editForm.id" label="ID" readonly />
          <v-text-field v-model="editForm.name" label="姓名" readonly />
          <v-select v-model="editForm.riskType" :items="riskOptions" label="風險類型" />
          <v-select v-model="editForm.status" :items="statusOptions" label="狀態" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">取消</v-btn>
          <v-btn color="primary" @click="updateAccount">更新</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { request } from '@/utils/BackAxiosUtil'
import member from '@/router/member'

const accounts = ref([])

const form = reactive({
  memberId: '',
  riskType: '',
  status: '',
  name: '',
})

const statusOptions = ['審查中', '已啟用', '已停權']
const riskOptions = ['保守型', '穩健型', '積極型']

const headers = ref([
  { title: '帳戶 ID', value: 'id' },
  { title: '會員 ID', value: 'memberId' },
  { title: '姓名', value: 'name' },
  { title: '風險類型', value: 'riskType' },
  { title: '狀態', value: 'status' },
  { title: '操作', value: 'actions', sortable: false },
])

// 初始讀取資料
const fetchAccounts = async () => {
  accounts.value = await request({
    url: '/fund-accounts',
    method: 'get',
  })
}

// 查詢
const getFundAccounts = async () => {
  accounts.value = await request({
    url: 'fund-accounts',
    method: 'get',
    params: {
      status: form.status,
      name: form.name,
    },
  })
}
const getForm = reactive({
  id: null,
  memberId: null,
  name: null,
  riskType: '',
  status: '',
})

//單筆查詢
const selectedAccount = reactive({
  memberId:'',
  name: '',
  memberAccount:'',
  password:'',
  identity:'',
  gender:'',
  address:'',
  phone:'',
  birthday:'',
  email:'',
  creation:'',
  memberStatus:'',
  accountId:'',
  balance:'',
  accountStatus:'',
  id:'',
  riskType: '',
  status: '',
})
const getDialog = ref(false)

const openGet = (id) => {
  getById(id)
  getDialog.value = true
}

const getById = async (id) => {
  const response = await request({
    url: `/fund-accounts/${id}`,
    method: 'get',
  })
  
  console.log('API 回傳資料：', response);

  // 將結果塞入 selectedAccount
  selectedAccount.memberId = response.member.mId
  selectedAccount.name = response.member.mName
  selectedAccount.memberAccount = response.member.mAccount
  selectedAccount.password = response.member.mPassword
  selectedAccount.identity = response.member.mIdentity
  selectedAccount.gender = response.member.mGender
  selectedAccount.address = response.member.mAddress
  selectedAccount.phone = response.member.mPhone
  selectedAccount.birthday = response.member.mBirthday
  selectedAccount.email = response.member.mEmail
  selectedAccount.creation = response.member.creation
  selectedAccount.memberStatus = response.member.mState
  selectedAccount.accountId = response.account.accountId
  selectedAccount.balance = response.account.balance
  selectedAccount.accountStatus = response.account.status
  selectedAccount.id = response.id
  selectedAccount.status = response.status
  selectedAccount.riskType = response.riskType
}

// 新增
const createAccount = async () => {
  await request({
    url: '/fund-accounts',
    method: 'post',
    params: {
      memberId: form.memberId,
      riskType: form.riskType,
    },
  })
  alert('新增成功')
  form.memberId = ''
  form.riskType = ''
  fetchAccounts()
}

// 刪除
const remove = async (id) => {
  if (!confirm('確定要刪除嗎？')) return
  await request({
    url: `/fund-accounts/${id}`,
    method: 'delete',
  })
  alert('刪除成功')
  fetchAccounts()
}

// 編輯功能
const editDialog = ref(false)
const editForm = reactive({
  id: null,
  name: null,
  riskType: '',
  status: '',
})

const openEdit = (item) => {
  editForm.id = item.id
  editForm.name = item.name
  editForm.riskType = item.riskType
  editForm.status = item.status
  editDialog.value = true
}

const updateAccount = async () => {
  await request({
    url: `/fund-accounts/${editForm.id}`,
    method: 'patch',
    params: {
      riskType: editForm.riskType,
      status: editForm.status,
    },
  })
  alert('更新成功')
  editDialog.value = false
  fetchAccounts()
}

// 掛載後自動載入
onMounted(fetchAccounts)
</script>
