<template>
  <tr>
    <td>{{ creditCard.applicationId }}</td>
    <td>{{ creditCard.member.mname }}</td>
    <td>{{ cardTypeMap[String(creditCard.cardType)] }}</td>
    <td><button class="image-link" @click="openImageModal(creditCard.idPhotoFront)">查看</button></td>
    <td><button class="image-link" @click="openImageModal(creditCard.idPhotoBack)">查看</button></td>
    <td><button class="image-link" @click="openImageModal(creditCard.financialProof)">查看</button></td>
    <td>{{ creditCard.applyDate }}</td>
    <td>{{ creditCard.status }}</td>
    <td>
      <v-btn variant="text" icon @click="openMemberModal(creditCard.member)">
        <v-icon color="grey darken-1">mdi-eye</v-icon>
      </v-btn>
    </td>
    <td>
      <template v-if="isPending">
        <v-btn color="primary" @click="openAuditModal(creditCard)">審核</v-btn>
      </template>
      <template v-else-if="creditCard.status === 'APPROVED'">
        <v-btn color="success" :disabled="isIssuing || isCardIssued" @click="onIssueCard">
          {{ isCardIssued ? '已發卡' : '發卡' }}
        </v-btn>
      </template>
    </td>
  </tr>
  
  <div v-if="showModal" class="modal-overlay" @click.self="closeImageModal">
    <div class="modal-content">
      <img :src="imageUrl" alt="Preview" />
      <button class="close-btn" @click="closeImageModal">關閉</button>
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
        <v-textarea v-model="auditComment" class="textArea" label="審核備註" rows="4" auto-grow outlined></v-textarea>
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
import { defineProps, ref, computed } from 'vue';

const props = defineProps({
  creditCard: { type: Object, required: true },
  isPending: { type: Boolean, default: false },
  handleApprove: { type: Function },
  handleReject: { type: Function },
  cardTypeMap: { type: Object, required: true },
  handleIssueCard: { type: Function },
  issuingIds: Object
});

const showModal = ref(false);
const imageUrl = ref('');
function openImageModal(path) {
  imageUrl.value = 'http://localhost:8080/bank' + path;
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
  auditComment.value = card.reviewComment || "";
  showAuditModal.value = true;
}
function closeAuditModal() {
  showAuditModal.value = false;
  selectedCard.value = null;
  auditComment.value = "";
}
function confirmApprove() {
  if (props.handleApprove) {
    props.handleApprove(selectedCard.value, auditComment.value);
  }
  closeAuditModal();
}
function confirmReject() {
  if (props.handleReject) {
    props.handleReject(selectedCard.value, auditComment.value);
  }
  closeAuditModal();
}

const isIssuing = computed(() => props.issuingIds[props.creditCard.applicationId] === true);
const isCardIssued = computed(() => props.creditCard.status === 'ISSUED');

async function onIssueCard() {
  if (isIssuing.value) return;
  if (props.handleIssueCard) {
    await props.handleIssueCard(props.creditCard);
  }
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
  z-index: 999;
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
.close-btn {
  margin-top: 15px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}

.image-link {
  background: none;
  border: none;
  color: #1976D2;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}
.image-link:hover {
  color: #1565C0;
}

.look-button, .image-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}
.look-button:hover, .image-button:hover {
  opacity: 0.8;
}
</style>