import axios from "axios";

//不同的功能，通过axios请求的是不同的接口地址
//127.0.0.1:19090
const service = axios.create({
  baseURL:"127.0.0.1:19090/system",
  timeout:5000,
})

export default service