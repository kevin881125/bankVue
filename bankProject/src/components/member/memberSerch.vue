<template>
  <div class="member-search">
    <h2>會員查詢</h2>

    <div class="form">
      <input v-model="form.name" placeholder="姓名" />
      <input v-model="form.account" placeholder="帳號" />
      <input v-model="form.phone" placeholder="電話" />
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.gender" placeholder="性別" />
      <input v-model="form.state" type="number" placeholder="狀態" />

      <label>生日起</label>
      <input v-model="form.startDate" type="date" />

      <label>生日訖</label>
      <input v-model="form.endDate" type="date" />

      <button @click="search">查詢</button>
    </div>

    <div class="result" v-if="members.length > 0">
      <p>共 {{ totalElements }} 筆資料</p>
      <table border="1">
        <thead>
          <tr>
            <th>編號</th>
            <th>姓名</th>
            <th>帳號</th>
            <th>電話</th>
            <th>生日</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.mId">
            <td>{{ member.mId }}</td>
            <td>{{ member.mName }}</td>
            <td>{{ member.mAccount }}</td>
            <td>{{ member.mPhone }}</td>
            <td>{{ formatDate(member.mBirthday) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button :disabled="page === 0" @click="page--">上一頁</button>
        <span>第 {{ page + 1 }} 頁</span>
        <button :disabled="page + 1 >= totalPages" @click="page++">
          下一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MemberSearch",
  data() {
    return {
      form: {
        name: "",
        account: "",
        phone: "",
        email: "",
        gender: "",
        state: "",
        startDate: "",
        endDate: "",
      },
      page: 0,
      size: 10,
      members: [],
      totalElements: 0,
      totalPages: 0,
    };
  },
  methods: {
    search() {
      const params = {
        page: this.page,
        size: this.size,
      };

      for (const key in this.form) {
        if (this.form[key] !== null && this.form[key] !== "") {
          params[key] = this.form[key];
        }
      }

      axios
        .get("/api/members/search", { params })
        .then((res) => {
          this.members = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        })
        .catch((err) => {
          console.error("查詢失敗：", err);
        });
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toISOString().slice(0, 10);
    },
  },
  watch: {
    page() {
      this.search(); // 換頁時自動查詢
    },
  },
};
</script>

<style scoped>
.member-search {
  max-width: 800px;
  margin: 20px auto;
}
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  padding: 5px;
}
button {
  padding: 5px 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
.pagination {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
