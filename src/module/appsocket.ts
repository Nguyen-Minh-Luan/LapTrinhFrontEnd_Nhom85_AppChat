const BASE_URL = "wss://chat.longapp.site/chat/chat";

export const EV_GET_ROOM_CHAT_MES = "GET_ROOM_CHAT_MES";

export interface ChatResponse {
  event: string;
  status: string;
  data: any;
}

export class ChatSocket {
  private url: string;
  private socket: WebSocket | null;
  public onMessageReceiveds: [(data: ChatResponse) => void | null];
  /**
   * @deprecated
   */
  public onMessageReceived: ((data: any) => void) | null;
  public onConnected: (() => void) | null;
  public onConnecteds: [(() => void) | null];
  public onError: ((event: Event) => void) | null;
  public onClosed: (() => void) | null;
  public response: any;

  /**
   * Khởi tạo một đối tượng ChatSocket và cố gắng kết nối đến máy chủ WebSocket.
   */
  constructor() {
    this.url = BASE_URL;
    this.socket = null;
    this.onMessageReceiveds = [null];
    this.onMessageReceived = null;
    this.onConnecteds = [null];
    this.onError = null;
    this.onClosed = null;
    this.response = null;
  }

  public isConnect(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    return true;
  }

  public reconnect(): void {
    if (!this.isConnect()) {
      this.connect();
    }
  }

  /**
   * Thiết lập kết nối WebSocket.
   * Đăng ký các hàm xử lý sự kiện khi kết nối mở, nhận tin nhắn, lỗi và đóng.
   */
  public connect(timeout = 60000): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      const timer = setTimeout(() => {
        reject(new Error("Connect timeout"));
      }, timeout);

      this.socket.onopen = () => {
        for (var call of this.onConnecteds) {
          if (call) {
            call();
          }
        }
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
          for (var call of this.onMessageReceiveds) {
            if (call) {
              call(data);
            }
          }
          if (this.onMessageReceived) {
            this.response = this.onMessageReceived(data);
          }
        } catch (e) {
          console.error("Lỗi khi phân tích tin nhắn:", e);
        }
      };

      this.socket.onclose = () => {
        clearTimeout(timer);
        this.reconnect();
        if (this.onClosed) this.onClosed();
      };
    });
  }

  private _sendAndWaitResponse(
    eventName: string,
    payload: Record<string, any>,
    expectedEvent: string,
    timeout = 60000,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error("Socket chưa mở"));
        return;
      }

      // Timeout handler
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${expectedEvent}`));
      }, timeout);

      // Lưu địa chỉ vùng nhớ của callback cũ
      const oldCallback = this.onMessageReceived;

      // Set callback ghi đè lên onMessageReceived() bên login asyncThunk để bắt response
      // onMessageReceived() bên login asyncThunk sẽ không mất vẫn còn tồn tại ở đâu đó, biến oldCallback đã lưu lại địa chỉ của nó
      this.onMessageReceived = (data) => {
        // Gọi callback cũ nếu có (để không ảnh hưởng logic khác)
        if (oldCallback) {
          oldCallback(data);
        }

        // Kiểm tra nếu là event mong đợi
        if (data.event === expectedEvent) {
          clearTimeout(timer);
          // 1 lần nữa set callback thành oldCallback (onMessageReceived() bên login asyncThunk) để trả lại logic ban đầu
          this.onMessageReceived = oldCallback;
          resolve(data);
        }
      };

      const message = {
        action: "onchat",
        data: {
          event: eventName,
          data: payload,
        },
      };

      this.socket.send(JSON.stringify(message));
    });
  }

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
    //công việc send đã kết thúc ngay tại đây (hãy nhìn nó như là 1 return của hàm này)
  }

  /**
   * Đăng ký người dùng mới.
   * @param user Tên người dùng.
   * @param pass Mật khẩu người dùng.
   */
  public async register(user: string, pass: string): Promise<any> {
    this.response = await this._sendAndWaitResponse(
      "REGISTER",
      { user, pass },
      "REGISTER",
    );
    return this.response;
  }

  /**
   * Đăng nhập người dùng.
   * @param user Tên người dùng.
   * @param pass Mật khẩu người dùng.
   */
  public async login(user: string, pass: string): Promise<any> {
    this.response = await this._sendAndWaitResponse(
      "LOGIN",
      { user, pass },
      "LOGIN",
    );
    return this.response;
  }

  /**
   * Đăng nhập lại người dùng bằng mã.
   * @param user Tên người dùng.
   * @param code Mã đăng nhập lại.
   */
  public reLogin(user: string, code: string): void {
    this._send("RE_LOGIN", {
      user: user,
      code: code,
    });
  }

  /**
   * Đăng xuất người dùng hiện tại.
   */
  public logout(): any {
    this._send("LOGOUT", {});
    return this.response;
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
    this._send("JOIN_ROOM", {
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
