<template>
  <form class="form" @submit.prevent>
    <p class="title">Passport </p>
    <div class="page-links">
      <a href="#" @click="state.active=0">用户名密码登录</a>
      <a href="#" @click="state.active=1">手机号登录</a>
      <a href="#" @click="state.active=2">手机号注册</a>
    </div>
<!--    用户名密码-->
    <label v-if="state.active===0">
      <input v-model="state.formData.username" required="" placeholder="" type="text" class="input">
      <span>用户名/邮箱/手机号</span>
    </label>
    <label v-if="state.active===0">
      <input v-model="state.formData.password" required="" placeholder="" type="password" class="input">
      <span>密码</span>
    </label>
    <div class="flex" v-if="state.active===0">
      <label v-if="state.active===0">
        <input v-model="state.formData.identifyCode" required="" placeholder="" type="text" class="input">
        <span>验证码</span>
      </label>
      <label>
        <div class="code" @click="refreshCode">
          <SIdentify :identifyCode="state.identifyCode"></SIdentify>
        </div>
      </label>
    </div>

    <button v-if="state.active===0" class="submit" @click="signInPassword">登录</button>
<!--    手机号-->
    <label v-if="state.active===1">
      <input v-model="state.formData.phone" required="" placeholder="" type="text" class="input">
      <span>手机号</span>
    </label>
    <div class="flex" v-if="state.active===1">
      <label>
        <input v-model="state.formData.verifyCode" class="input" type="text" placeholder="" required="">
        <span>验证码</span>
      </label>
      <label>
        <button class="submit-send" @click="sendSignInCode">发送验证码</button>
      </label>
    </div>
    <button v-if="state.active===1" class="submit" @click="signInPhone">登录</button>
    <!--    手机号注册-->
    <label v-if="state.active===2">
      <input v-model="state.formData.username" required="" placeholder="" type="text" class="input">
      <span>用户名</span>
    </label>
    <label v-if="state.active===2">
      <input v-model="state.formData.phone" required="" placeholder="" type="text" class="input">
      <span>手机号</span>
    </label>
    <div class="flex" v-if="state.active===2">
      <label>
        <input v-model="state.formData.verifyCode" class="input" type="text" placeholder="" required="">
        <span>验证码</span>
      </label>
      <label>
        <button class="submit-send" @click="sendRegisterCode">发送验证码</button>
      </label>
    </div>
    <button v-if="state.active===2" class="submit" @click="register">注册</button>
<!--    <p class="signin">Already have an acount ? <a href="#">Signin</a> </p>-->
  </form>

</template>
<script setup lang="ts">
import { ref,reactive,onMounted} from 'vue'
import {signUpPhoneApi} from "/@/api/signup";
import {ElMessage} from "element-plus";
import {signInSendCodeApi, signUpSendCodeApi} from "/@/api/send";
import {signInPasswordApi, signInPhoneApi} from "/@/api/signin";
import { useRoute } from 'vue-router';
import {Local} from "/@/utils/storage";
import SIdentify from "/@/components/Sidentify.vue";
const route = useRoute();
const state = reactive({
  active:0 ,
  formData:{
    username:"",
    password:"",
    phone:"",
    verifyCode:"",
    identifyCode:"",
  },
  originUrl:"",
  token:"",
  identifyCode:"",
  // identifyCodes:"1234567890abcdefjhijklinopqrsduvwxyz"
  identifyCodes:"1234567890"
})
onMounted(() => {
  getUrl()
  state.identifyCode=""
  makeCode(state.identifyCodes, 4)
})
// 生成随机数
function randomNum(min, max){
  return Math.floor(Math.random() * (max - min) + min)
}
// 随机生成验证码字符串
function makeCode(o, l){

  for (let i = 0; i < l; i++) {
    state.identifyCode+= o[randomNum(0, o.length)]
  }
  // console.log(state.identifyCode)
}
// 更新验证码
function refreshCode () {
  state.identifyCode = ''
  makeCode(state.identifyCodes, 4)
}
  function getOpenUrl(url: any,token:any) {
  var openUrl = ''
  var path=decodeURIComponent(url)
  if (path) {
    if (path.indexOf("?") < 0) {
      openUrl = path + "?token=" + token
    } else {
      openUrl = path + "&token=" + token
    }
  }
  return openUrl;
}
function getUrl(){
  if(route.query.url===""||route.query.url===undefined){
    state.originUrl="https://sg.thingplecloud.com/profile"//默认返回地址
    Local.remove('token')
    // ElMessage.error("路径错误")
  }else{
    state.originUrl=encodeURIComponent(route.query.url)
    console.log('originUrl',state.originUrl)
  }
  //获取缓存token
  state.token=Local.get('token')
  if(state.token!==null){
    login()
  }
}
function signInPassword(){
  // console.log(123)
  if(state.identifyCode!==state.formData.identifyCode){
    //验证码错误
    ElMessage.error('验证码错误');
    return
  }
  signInPasswordApi({
    username:state.formData.username,
    password:state.formData.password,
    loginType:"pc"
  }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success('登录成功');
      state.token=res.token
      login()
    } else {
      ElMessage.error('登录失败');
      refreshCode()
    }
  });
}
function sendSignInCode(){
  signInSendCodeApi({
    receiver:state.formData.phone,
    codeLoginType:"sms",
  }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success('发送成功');
    } else {
      ElMessage.error('发送失败');
    }
  });
}
function signInPhone(){
  signInPhoneApi({
    username:state.formData.phone,
    code:state.formData.verifyCode,
    loginType:"pc"
  }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success('登录成功');
      state.token=res.token
      login()
    } else {
      ElMessage.error('登录失败');
    }
  });
}
function sendRegisterCode(){
  signUpSendCodeApi({
    receiver:state.formData.phone,
    codeLoginType:"sms",
  }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success('发送成功');
    } else {
      ElMessage.error('发送失败');
    }
  });
}
function register(){
  //注册
  signUpPhoneApi({
    username:state.formData.username,
    mobile:state.formData.phone,
    code:state.formData.verifyCode,
  }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success('注册成功');
      state.active=0
    } else {
      ElMessage.error('注册失败');
    }
  });
}
function login(){
  var url=getOpenUrl(state.originUrl,state.token)
  //pp保存token
  // Local.set("token",state.token)
  //原路径返回
  window.location.replace(url)
}
</script>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 20px;
  position: relative;
}

.title {
  font-size: 28px;
  color: royalblue;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 30px;
}

.title::before,.title::after {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  border-radius: 50%;
  left: 0px;
  background-color: royalblue;
}

.title::before {
  width: 18px;
  height: 18px;
  background-color: royalblue;
}

.title::after {
  width: 18px;
  height: 18px;
  animation: pulse 1s linear infinite;
}

.message, .signin {
  color: rgba(88, 87, 87, 0.822);
  font-size: 14px;
}

.signin {
  text-align: center;
}

.signin a {
  color: royalblue;
}

.signin a:hover {
  text-decoration: underline royalblue;
}

.flex {
  margin-left: 0px;
  display: flex;
  width: 95%;
  gap: 6px;
  align-items: center;
}

.form label {
  position: relative;
}

.form label .input {
  width: 90%;
  padding: 10px 10px 20px 10px;
  outline: 0;
  border: 1px solid rgba(105, 105, 105, 0.397);
  border-radius: 10px;
}

.form label .input + span {
  position: absolute;
  left: 10px;
  top: 15px;
  color: grey;
  font-size: 0.9em;
  cursor: text;
  transition: 0.3s ease;
}

.form label .input:placeholder-shown + span {
  top: 15px;
  font-size: 0.9em;
}

.form label .input:focus + span,.form label .input:valid + span {
  top: 30px;
  font-size: 0.7em;
  font-weight: 500;
}

.form label .input:valid + span {
  color: green;
}

.submit {
  margin-top: 15px;
  border: none;
  outline: none;
  background-color: royalblue;
  padding: 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transform: .3s ease;
}

.submit:hover {
  background-color: rgb(56, 90, 194);
}

.submit-send {
  margin-left: 5px;
  border: none;
  outline: none;
  background-color: royalblue;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  transform: .3s ease;
  padding: 0.8em 0.5em;
  height: 80%;
}

.submit-send:hover {
  background-color: rgb(56, 90, 194);
}
@keyframes pulse {
  from {
    transform: scale(0.9);
    opacity: 1;
  }

  to {
    transform: scale(1.8);
    opacity: 0;
  }
}
.page-links {
  margin-bottom: 34px;
}

.page-links a {
  position: relative;
  display: inline-block;
  text-decoration: none;
  color:rgb(56, 90, 194);
  font-weight: 300;
  font-size: 15px;
  margin-right: 20px;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.page-links a:last-child {
  margin-right: 0;
}

.page-links a:after {
  position: absolute;
  content: "";
  width: 100%;
  height: 2px;
  left: 0;
  bottom: -10px;
  background-color: rgba(56, 90, 194, 0.37);
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.page-links a.active {
  font-weight: 700;
}

.page-links a.active:after {
  background-color: rgb(56, 90, 194);

}

.page-links a:hover:after, .page-links a:focus:after {
  background-color: rgb(56, 90, 194);
}
</style>
