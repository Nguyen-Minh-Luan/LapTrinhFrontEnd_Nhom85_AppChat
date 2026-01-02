const BASE_URL = "wss://chat.longapp.site/chat/chat";

export class ChatSocket {
  private url: string;
  private socket: WebSocket | null;
  public onMessageReceived: ((data: any) => void) | null;
  public onConnected: (() => void) | null;
  public onError: ((event: Event) => void) | null;
  public onClosed: (() => void) | null;

  /**
   * Khởi tạo một đối tượng ChatSocket và cố gắng kết nối đến máy chủ WebSocket.
   */
  constructor() {
    this.url = BASE_URL;
    this.socket = null;
    this.onMessageReceived = null;
    this.onConnected = null;
    this.onError = null;
    this.onClosed = null;

  }
  public isConnect (): boolean{
    if(!this.socket || this.socket.readyState !== WebSocket.OPEN){
      return false
    }
    return true
  }
  /**
   * Thiết lập kết nối WebSocket.
   * Đăng ký các hàm xử lý sự kiện khi kết nối mở, nhận tin nhắn, lỗi và đóng.
   */
  public connect(timeout = 60000): Promise<void> {
  // Nếu socket đã mở thì resolve ngay
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    this.socket = new WebSocket(this.url);

    const timer = setTimeout(() => {
      reject(new Error("Connect timeout"));
    }, timeout);

    this.socket.onopen = () => {
      clearTimeout(timer);
      console.log("onopen, readyState:", this.socket?.readyState);
      if (this.onConnected) this.onConnected();
      resolve();
    };

    this.socket.onerror = (error: Event) => {
      clearTimeout(timer);
      console.error("Lỗi WebSocket:", error);
      if (this.onError) this.onError(error);
      reject(error);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageReceived) this.onMessageReceived(data);
      } catch (e) {
        console.error("Lỗi khi phân tích tin nhắn:", e);
      }
    };

    this.socket.onclose = () => {
      clearTimeout(timer);
      if (this.onClosed) this.onClosed();
    };
  });
}

//   public waitingForConnecting(timeout = 60000): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const timestart = Date.now();
//     const checkConnection = () => {
//       if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//         resolve();
//       } else if (Date.now() - timestart > timeout) {
//         reject(new Error("waitingForConnecting: timeout"));
//       } else {
//         setTimeout(checkConnection, 500);
//       }
//     };
//     checkConnection();
//   });
// }

  /**
   * Gửi một tin nhắn đến máy chủ WebSocket.
   * @param eventName Tên của sự kiện (ví dụ: "REGISTER", "LOGIN", "SEND_CHAT").
   * @param payload Dữ liệu liên quan đến sự kiện.
   */
  private _send(eventName: string, payload: Record<string, any>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket chưa mở. Không thể gửi:", eventName);
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
   * Đăng ký người dùng mới.
   * @param user Tên người dùng.
   * @param pass Mật khẩu người dùng.
   */
  public register(user: string, pass: string): void {
    this._send("REGISTER", {
      user: user,
      pass: pass,
    });
  }

  /**
   * Đăng nhập người dùng.
   * @param user Tên người dùng.
   * @param pass Mật khẩu người dùng.
   */
  public login(user: string, pass: string): void {
    this._send("LOGIN", {
      user: user,
      pass: pass,
    });
  }

  /**
   * Đăng nhập lại người dùng bằng mã.
   * @param user Tên người dùng.
   * @param code Mã đăng nhập lại.
   */
  public reLogin(user: string, code: string): void {
    this._send("RE LOGIN", {
      user: user,
      code: code,
    });
  }

  /**
   * Đăng xuất người dùng hiện tại.
   */
  public logout(): void {
    this._send("LOGOUT", {});
  }

  /**
   * Tạo một phòng chat mới.
   * @param roomName Tên của phòng chat.
   */
  public createRoom(roomName: string): void {
    this._send("CREATE_ROOM", {
      name: roomName,
    });
  }

  /**
   * Tham gia một phòng chat.
   * @param roomName Tên của phòng chat cần tham gia.
   */
  public joinRoom(roomName: string): void {
    this._send("JOIN ROOM", {
      name: roomName,
    });
  }

  /**
   * Lấy tin nhắn chat của phòng.
   * @param roomName Tên phòng chat.
   * @param page Số trang (mặc định là 1).
   */
  public getRoomChatMes(roomName: string, page: number = 1): void {
    this._send("GET_ROOM_CHAT_MES", {
      name: roomName,
      page: page,
    });
  }

  /**
   * Lấy tin nhắn chat giữa hai người.
   * @param userName Tên người dùng đối tác chat.
   * @param page Số trang (mặc định là 1).
   */
  public getPeopleChatMes(userName: string, page: number = 1): void {
    this._send("GET_PEOPLE_CHAT_MES", {
      name: userName,
      page: page,
    });
  }

  /**
   * Gửi tin nhắn chat.
   * @param type Loại tin nhắn ('room' hoặc 'people').
   * @param to Đối tượng nhận tin nhắn (tên phòng hoặc tên người dùng).
   * @param mes Nội dung tin nhắn.
   */
  public sendChat(type: "room" | "people", to: string, mes: string): void {
    this._send("SEND_CHAT", {
      type: type,
      to: to,
      mes: mes,
    });
  }

  /**
   * Gửi tin nhắn đến một phòng chat.
   * @param roomName Tên phòng chat.
   * @param message Nội dung tin nhắn.
   */
  public sendChatToRoom(roomName: string, message: string): void {
    this.sendChat("room", roomName, message);
  }

  /**
   * Gửi tin nhắn đến một người dùng.
   * @param userName Tên người dùng.
   * @param message Nội dung tin nhắn.
   */
  public sendChatToPeople(userName: string, message: string): void {
    this.sendChat("people", userName, message);
  }

  /**
   * Kiểm tra sự tồn tại của người dùng.
   * @param userName Tên người dùng cần kiểm tra.
   */
  public checkUser(userName: string): void {
    this._send("CHECK USER", {
      user: userName,
    });
  }

  /**
   * Lấy danh sách người dùng.
   */
  public getUserList(): void {
    this._send("GET_USER_LIST", {});
  }
}

export const CURRENT_SOCKET = new ChatSocket();
