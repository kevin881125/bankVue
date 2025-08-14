<template >
    <div>信用卡管理</div>
   
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block to="/yuzubank/backmain/creditCard/review" tag="router-link">審核信用卡</v-btn>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block to="/yuzubank/backmain/creditCard/transaction" tag="router-link">交易管理</v-btn>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block to="/yuzubank/backmain/creditCard/bill" tag="router-link">帳單管理</v-btn>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block>Button</v-btn>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block>Rounded lg</v-btn>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <v-btn rounded="xl" size="x-large" block>Rounded xl</v-btn>
      </v-col>
    </v-row>
  </v-container>

</template>
<script setup>

</script>
<style scoped>
    
</style>