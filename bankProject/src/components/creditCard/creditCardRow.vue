<template>
    <tr>
        <td>{{ creditCard.applicationId }}</td>
        <td>{{ creditCard.member.mname }}</td>
        <td>{{ cardTypeMap[String(creditCard.cardType)] }}</td>
        <td><button @click="openImageModal(creditCard.idPhotoFront)">查看</button></td>
        <td><button @click="openImageModal(creditCard.idPhotoBack)">查看</button></td>
        <td><button @click="openImageModal(creditCard.financialProof)">查看</button></td>
        <td>{{ creditCard.applyDate }}</td>
        <td>{{ creditCard.status }}</td>
        <td>
            <button class="look" @click="openMemberModal(creditCard.member)">
                <span class="mdi mdi-eye"></span>
            </button>
        </td>
        <td v-if="isPending">
           <v-btn color="primary" @click="openAuditModal(creditCard)">審核</v-btn>
        </td>
  </tr>
  
<!-- Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeImageModal">
    <div class="modal-content">
      <img :src="imageUrl" alt="Preview" />
      <button @click="closeImageModal">關閉</button>
    </div>
  </div>

<v-dialog v-model="showMemberModal" max-width="400">
  <v-card>
    <v-card-title>申請人資訊</v-card-title>
    <v-divider></v-divider>

    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>姓名</v-list-item-title>
          <v-list-item-subtitle>{{ memberInfo.mname }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>身分證字號</v-list-item-title>
          <v-list-item-subtitle>{{ memberInfo.midentity }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>生日</v-list-item-title>
          <v-list-item-subtitle>{{ new Date(memberInfo.mbirthday).toLocaleDateString() }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>電話</v-list-item-title>
          <v-list-item-subtitle>{{ memberInfo.mphone }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>地址</v-list-item-title>
          <v-list-item-subtitle>{{ memberInfo.maddress }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="closeMemberModal">關閉</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="showAuditModal" max-width="500">
    <v-card>
      <v-card-title>審核卡片申請</v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <p><strong>申請編號：</strong>{{ selectedCard?.applicationId }}</p>
        <p><strong>卡種：</strong>{{ cardTypeMap[String(creditCard.cardType)] }}</p>

        <v-textarea
          v-model="auditComment"
          label="審核備註"
          rows="4"
          auto-grow
          outlined
        ></v-textarea>
      </v-card-text>

      <v-card-actions>
        <v-btn color="green" @click="confirmApprove">通過</v-btn>
        <v-btn color="red" @click="confirmReject">拒絕</v-btn>
        <v-spacer></v-spacer>
        <v-btn text @click="closeAuditModal">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


</template>
<script setup>
import { defineProps } from 'vue';
import { ref } from 'vue';

const props =defineProps({
  creditCard: { type: Object, required: true },
  isPending: { type: Boolean, default: false }, 
  handleApprove: { type: Function, required: true },
  handleReject: { type: Function, required: true },
  card:{type:Object},
  cardTypeMap:{type:Object}
});
const showModal = ref(false);
const imageUrl = ref('');

function openImageModal(path) {
  imageUrl.value = 'http://localhost:8080/bank' + path; // 替換為你的 API 網域
  showModal.value = true;
}

function closeImageModal() {
  showModal.value = false;
}

const showMemberModal = ref(false);
const memberInfo = ref({});

function openMemberModal(member) {
  memberInfo.value = member;
  showMemberModal.value = true;
}
function closeMemberModal() {
  showMemberModal.value = false;
}
const showAuditModal = ref(false);
const selectedCard = ref(null);
const auditComment = ref("");

function openAuditModal(card) {
  selectedCard.value = card;
  auditComment.value = card.reviewComment || ""; // 用已有備註或空字串
  showAuditModal.value = true;
}

function closeAuditModal() {
  showAuditModal.value = false;
  selectedCard.value = null;
  auditComment.value = "";
}

function confirmApprove() {
  props.handleApprove(selectedCard.value, auditComment.value);
  closeAuditModal();
}


function confirmReject() {
  props.handleReject(selectedCard.value, auditComment.value);
  closeAuditModal();
}

</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.modal-content img {
  max-width: 500px;
  max-height: 500px;
}

td{
    text-align: center;
}

.btn{
    display: flex; 
    gap: 8px;
    justify-content: center;
}

</style>