// validator.js

// 簡單的 Email 驗證
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 簡單的密碼驗證（至少 8 碼，包含數字和英文）
function isValidPassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

// 台灣身分證字號驗證（簡化版）
function isValidTaiwanId(id) {
  const regex = /^[A-Z][12]\d{8}$/;
  return regex.test(id);
}

// 日期驗證
function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// 總驗證方法
export function validateMember(form, fields, errorMessage) {
  const errors = {};
  if (form.mName == "") {
    errorMessage.mName = "名子不能為空白";
    fields[0].error = true;
  }

  if (!form.mIdentity || !isValidTaiwanId(form.mIdentity)) {
    errorMessage.mIdentity = "身分證字號格式不正確";
    fields[1].error = true;
  }

  if (!form.mEmail || !isValidEmail(form.mEmail)) {
    errorMessage.mEmail = "Email 格式不正確";
    fields[8].error = true;
  }

  if (!form.mPassword || !isValidPassword(form.mPassword)) {
    errorMessage.mPassword = "密碼至少 8 碼，且需包含英文與數字";
    fields[4].error = true;
  }

  return Object.keys(errors).length === 0 ? true : errors;
}
