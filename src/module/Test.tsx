import React, { use, useEffect } from "react";
import { CURRENT_SOCKET } from "../module/appsocket.ts";
const Test = () =>{


useEffect(() => {
    CURRENT_SOCKET.connect();
  CURRENT_SOCKET.onConnected = () => {
    console.log("✅ Socket connected");

    // TEST LOGIN NGAY SAU KHI CONNECT
    CURRENT_SOCKET.login("testuser", "123");
  };

  CURRENT_SOCKET.onMessageReceived = (data) => {
    console.log("📩 Server response:", data);
  };

  CURRENT_SOCKET.onError = (e) => {
    console.log("❌ Socket error", e);
  };

  CURRENT_SOCKET.onClosed = () => {
    console.log("🔌 Socket closed");
  };
}, []);
return (
    <div>mở f12 lên coi</div>
);
}
export default Test;