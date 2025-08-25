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
  let err = true;
  if (form.mName == "") {
    errorMessage.mName = "名子不能為空白";
    fields.value[0].error = true;
    err = false;
  }

  if (form.mIdentity == "" || !isValidTaiwanId(form.mIdentity)) {
    errorMessage.mIdentity = "身分證字號格式不正確";
    fields.value[1].error = true;
    err = false;
  }

  if (form.mGender == "") {
    errorMessage.mGender = "請選擇性別";
    fields.value[2].error = true;
    err = false;
  }
  if (form.mAccount == "") {
    errorMessage.mAccount = "帳號不能為空白";
    fields.value[3].error = true;
    err = false;
  }
  if (form.mPhone == "") {
    errorMessage.mPhone = "電話不能為空白";
    fields.value[6].error = true;
    err = false;
  }
  if (form.mBirthday == null) {
    errorMessage.mBirthday = "生日不能為空白";
    fields.value[7].error = true;
    err = false;
  }

  if (form.mAddress == "") {
    errorMessage.mAddress = "地址不能為空白";
    fields.value[5].error = true;
    err = false;
  }

  if (!form.mEmail || !isValidEmail(form.mEmail)) {
    errorMessage.mEmail = "Email 格式不正確";
    fields.value[8].error = true;
    err = false;
  }

  if (!form.mPassword || !isValidPassword(form.mPassword)) {
    errorMessage.mPassword = "密碼至少 8 碼，且需包含英文與數字";
    fields.value[4].error = true;
    err = false;
  }
  return err;
}

export function validateMember2(memberdetail, errors, errorMessage) {
  let err = true;
  if (memberdetail.value.mName == "") {
    errorMessage.mName = "名子不能為空白";
    errors.value.mName = true;
    err = false;
    console.log("1");
  }else{
    errors.value.mName = false;
    errorMessage.mName ="";
  }

  if (
    memberdetail.value.mIdentity == "" ||
    !isValidTaiwanId(memberdetail.value.mIdentity)
  ) {
    errorMessage.mIdentity = "身分證字號格式不正確";
    errors.value.mIdentity = true;
    err = false;
  }else{
    errors.value.mIdentity = false;
    errorMessage.mIdentity="";
  }

  if (memberdetail.value.mGender == "") {
    errorMessage.mGender = "請選擇性別";
    errors.value.mGender = true;
    err = false;
  }else{
    errors.value.mGender = false;
    errorMessage.mGender =""
  }
  if (memberdetail.value.mAccount == "") {
    errorMessage.mAccount = "帳號不能為空白";
    errors.value.mAccount = true;
    err = false;
  }else{
    errors.value.mAccount = false;
    errorMessage.mAccount="";
  }
  if (memberdetail.value.mPhone == "") {
    errorMessage.mPhone = "電話不能為空白";
    errors.value.mPhone = true;
    err = false;
  }else{
    errors.value.mPhone = false;
     errorMessage.mPhone = ""
  }
  if (memberdetail.value.mBirthday == null) {
    errorMessage.mBirthday = "生日不能為空白";
    errors.value.mBirthday = true;
    err = false;
  }else{
    errors.value.mBirthday = false;
    errorMessage.mBirthday = "";
  }

  if (memberdetail.value.mAddress == "") {
    errorMessage.mAddress = "地址不能為空白";
    errors.value.mAddress = true;
    err = false;
  }else{
    errors.value.mAddress = false;
     errorMessage.mAddress ="";
  }

  if (!memberdetail.value.mEmail || !isValidEmail(memberdetail.value.mEmail)) {
    errorMessage.mEmail = "Email 格式不正確";
    errors.value.mEmail = true;
    err = false;
  }else{
    errors.value.mEmail = false;
    errorMessage.mEmail = "";
  }

  if (
    !memberdetail.value.mPassword ||
    !isValidPassword(memberdetail.value.mPassword)
  ) {
    errorMessage.mPassword = "密碼至少 8 碼，且需包含英文與數字";
    errors.value.mPassword = true;
    err = false;
  }else{
    errors.value.mPassword = false;
    errorMessage.mPassword = "";
  }

  console.log(err);

  return err;
}
