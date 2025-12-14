const BASE_URL = "wss://chat.longapp.site/chat";

export class ChatSocket {
  constructor() {
    this.url = BASE_URL;
    this.socket = null;
    this.onMessageReceived = null;
    this.onConnected = null;
    this.onError = null;
    this.onClosed = null;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      if (this.onConnected) this.onConnected();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageReceived) this.onMessageReceived(data);
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      if (this.onError) this.onError(error);
    };

    this.socket.onclose = () => {
      if (this.onClosed) this.onClosed();
    };
  }

  _send(eventName, payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket is not open. Cannot send:", eventName);
      return;
    }

    const message = {
      action: "onchat",
      data: {
        event: eventName,
        data: payload,
      },
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * REGISTER
   * @param {string} user
   * @param {string} pass
   */
  register(user, pass) {
    this._send("REGISTER", {
      user: user,
      pass: pass,
    });
  }

  /**
   * LOGIN
   * @param {string} user
   * @param {string} pass
   */
  login(user, pass) {
    this._send("LOGIN", {
      user: user,
      pass: pass,
    });
  }

  reLogin(user, code) {
    this._send("RE LOGIN", {
      user: user,
      code: code,
    });
  }

  logout() {
    this._send("LOGOUT", {});
  }

  createRoom(roomName) {
    this._send("CREATE_ROOM", {
      name: roomName,
    });
  }

  joinRoom(roomName) {
    this._send("JOIN ROOM", {
      name: roomName,
    });
  }

  getRoomChatMes(roomName, page = 1) {
    this._send("GET_ROOM_CHAT_MES", {
      name: roomName,
      page: page,
    });
  }

  getPeopleChatMes(userName, page = 1) {
    this._send("GET_PEOPLE_CHAT_MES", {
      name: userName,
      page: page,
    });
  }

  /**
   * API: SEND_CHAT
   * @param {string}
   * @param {string}
   * @param {string}
   */
  sendChat(type, to, mes) {
    this._send("SEND_CHAT", {
      type: type,
      to: to,
      mes: mes,
    });
  }

  sendChatToRoom(roomName, message) {
    this.sendChat("room", roomName, message); //
  }

  sendChatToPeople(userName, message) {
    this.sendChat("people", userName, message); //
  }

  checkUser(userName) {
    this._send("CHECK USER", {
      user: userName,
    });
  }

  getUserList() {
    this._send("GET_USER_LIST", {});
  }
}

export const CURRENT_SOCKET = new ChatSocket();
