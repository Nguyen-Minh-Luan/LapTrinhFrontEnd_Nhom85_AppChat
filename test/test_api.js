import { CURRENT_SOCKET } from "../src/module/appsocket.js";

var app = CURRENT_SOCKET;

app.onMessageReceived = function (data) {
  console.log(data);
};

app.onError = function (e) {
  console.log(e.message);
};

app.register("22130102", "123");
