import { useEffect } from "react";
import { CURRENT_SOCKET } from "../../module/appsocket";

declare global {
  interface Window {
    app: any;
  }
}

export function TestModule() {
  CURRENT_SOCKET.onMessageReceiveds.push((data) => {
    console.log(data);
  });

  useEffect(() => {
    window.app = {
      CURRENT_SOCKET: CURRENT_SOCKET,
      login: (username: string, password: string) => {
        CURRENT_SOCKET.login(username, password);
      },
      register: (username: string, password: string) => {
        CURRENT_SOCKET.register(username, password);
      },
      createRoom: (roomName: string) => {
        CURRENT_SOCKET.createRoom(roomName);
      },
      joinRoom: (roomName: string) => {
        CURRENT_SOCKET.joinRoom(roomName);
      },
      getRoomChatMes: (roomName: string) => {
        CURRENT_SOCKET.getRoomChatMes(roomName);
      },
      sendChatToRoom: (roomName: string, mess: string) => {
        CURRENT_SOCKET.sendChatToRoom(roomName, mess);
      },
    };
  });

  return <></>;
}
