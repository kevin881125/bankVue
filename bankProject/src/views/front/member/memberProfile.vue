<template>
  <div class="bgc">
    <div class="container">
      <div class="topbar">
        <div class="Headshot">
          <img src="../../../image/logo_black.svg" alt="" />
          <button></button>
          <h1>你好,莉莉姐</h1>
        </div>
        <div class="total">
            <div class="all">
                <div class="title">淨資產</div>
                  <div class="number">TWD 83415</div>
            </div>
            <div class="hh"></div>
            <div class="down">

                <div class="assets">
                  <div class="title">資產</div>
                  <div class="number">TWD 83415</div>
                </div>
                <div class="cc"></div>
                <div class="dept">
                  <div class="title">信用卡與貸款</div>
                  <div class="number">TWD 83415</div>
                </div>
            </div>
        </div>
      </div>
      <div class="totalAssets">
        <div class="assetGraphics">
         <div class="graphics"></div> 
          <div class="illustrate">
            <ul>
                <li>戶頭餘額</li>
                <li>基金金額</li>
            </ul>
          </div>
        </div>
        <div class="debtGraphic">
          <div class="graphics">放圓形照片</div> 
          <div class="illustrate">這是戶頭,這是基金</div>
        </div>
      </div>
      <div class="PersonalInf">
          <h1>個人資料修改</h1>
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
*{
    position: relative;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    /*border: 1px solid #000;*/
}
.bgc{
    width: 100%;
    height: 1600px;
    background-image: url('../../../image/member/f1.jpg'),url();
    background-position: -210px -380px;
    background-size: 120%;
    display: flex;
    background-color: #fafafa;
    justify-content: center;
    
}
.container{
    min-width: 1280px;
    top: 200px;
}

/*-----------------------上--------------------*/ 
.topbar{
    width: 100%;
    height: 150px;
    background-color: #fff;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}
.Headshot{
    width: 30%;
    display: flex;
    align-items: center;
    padding: 5px;
}
.Headshot>img{
    width: 110px;
    height: 110px;
    border-radius: 50%;
    margin-right: 50px;
    border: 1px solid #000;
}
.Headshot>button{
    position: absolute;
    width: 40px;
    height: 40px;
    top: 75%;
    left: 25%;
    border-radius: 50%;
    border: 1px solid #000;
    transform: translate(-50%,-50%);
}
.total{
    width: 66%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
}
.total>.down{
    display: flex;
}
.assets{
    width: 50%;
    display: flex;
    justify-content: space-between;
 
}
.dept{
    width: 50%;
    display: flex;
    justify-content: space-between;

}
.all{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

}
.title{
    font-size: 20px;
    border-left: 5px solid #0ed0d6;
    padding-left: 10px;
}
.number{
    text-align: right;
    font-size: 20px;
}
.hh{
    margin-bottom: 10px;
    width: 99%;
    height: 1px;
    margin-right: auto;
    margin-left: auto;
    background-color: #dbd9d9;
}
.cc{
    height: 100%;
    width: 1px;
    background-color: #dbd9d9;
    margin-right: 10px;
    margin-left: 10px;
}
/*-----------------------中--------------------*/ 

.totalAssets{
    width: 100%;
    height: 350px;
    background-color: #fff;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    display: flex;
    justify-content: center;
}
.assetGraphics{
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.assetGraphics>.graphics{
    width: 200px;
    height:200px;
    background-color: #cf0000;
    border-radius: 50%;
    margin-right: 50px;
}
.assetGraphics>.illustrate{

}

.debtGraphic{
    width: 50%;
    display: flex;
     justify-content: center;
    align-items: center;
}


</style>
