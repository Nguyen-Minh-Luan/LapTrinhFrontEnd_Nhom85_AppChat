const BASE_URL = "wss://chat.longapp.site/chat/chat";

export const EV_GET_ROOM_CHAT_MES = "GET_ROOM_CHAT_MES";
export const EV_GET_PEOPLE_CHAT_MES = "GET_PEOPLE_CHAT_MES";
export const EV_GET_USER_LIST = "GET_USER_LIST";

export interface ChatResponse {
  event: string;
  status: string;
  data: any;
  mes: string;
}

type MessageCallback = (id: string, data: ChatResponse) => void;

export class ChatSocket {
  private url: string;
  private socket: WebSocket | null;
  private messageListeners: Map<string, MessageCallback>;
  public onMessageReceiveds: [(data: ChatResponse) => void | null];
  /**
   * @deprecated
   */
  public onMessageReceived: ((data: any) => void) | null;
  /**
   * @deprecated
   */
  public onConnected: (() => void) | null;
  public onConnecteds: [(() => void) | null];
  public onError: ((event: Event) => void) | null;
  public onClosed: (() => void) | null;
  public response: any;
  public shouldReconnect: boolean | true;
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
    this.shouldReconnect = true;
    this.messageListeners = new Map();
  }

  /**
   * Đăng ký một callback nhận tin nhắn với định danh cụ thể.
   * Nếu ID đã tồn tại, callback cũ sẽ bị thay thế bằng callback mới.
   * @param id Tên định danh (ví dụ: "ChatPanel", "NotificationService")
   * @param callback Hàm xử lý data
   */
  public addMessageReceived(id: string, callback: MessageCallback): void {
    if (id && callback) {
      this.messageListeners.set(id, callback);
    }
  }

  /**
   * Hủy đăng ký callback theo định danh.
   * @param id Tên định danh cần xóa
   */
  public removeMessageReceived(id: string): void {
    if (this.messageListeners.has(id)) {
      this.messageListeners.delete(id);
    }
  }

  public isConnect(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    return true;
  }

  public reconnect(): void {
    if (!this.isConnect() && this.shouldReconnect) {
      this.connect();
    }
  }
  public disconnect(): void {
    this.shouldReconnect = false; // Disable auto-reconnect
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  /**
   * Thiết lập kết nối WebSocket.
   * Đăng ký các hàm xử lý sự kiện khi kết nối mở, nhận tin nhắn, lỗi và đóng.
   */
  public connect(timeout = 3600000): Promise<void> {
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
            try {
              call();
            } catch (e) {
              console.log(e);
            }
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
          this.messageListeners.forEach((callback, id) => {
            try {
              callback(id, data);
            } catch (err) {
              console.error(`Error in listener [${id}]:`, err);
            }
          });
          for (var call of this.onMessageReceiveds) {
            if (call) {
              try {
                call(data);
              } catch (e) {
                console.log(e);
              }
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
    timeout = 3600000,
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
  public async reLogin(user: string, code: string): Promise<any> {
    this.response = await this._sendAndWaitResponse(
      "RE_LOGIN",
      { user, code },
      "RE_LOGIN",
    );
    return this.response;
  }

  /**
   * Đăng xuất người dùng hiện tại.
   */
  public async logout(): Promise<any> {
    this.response = await this._sendAndWaitResponse("LOGOUT", {}, "LOGOUT");
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

  /**
   * MỚI: Lấy TOÀN BỘ tin nhắn của phòng (tự động phân trang 1->100).
   * @param roomName Tên phòng
   * @returns Promise<Array> Danh sách tin nhắn thô
   */
  public async getAllRoomChatMes(roomName: string): Promise<any[]> {
    let allMessages: any[] = [];
    const MAX_PAGE = 100;

    for (let page = 1; page <= MAX_PAGE; page++) {
      try {
        const response = await this._sendAndWaitResponse(
          "GET_ROOM_CHAT_MES",
          { name: roomName, page: page },
          EV_GET_ROOM_CHAT_MES,
        );
        const pageData = response.data?.chatData || [];

        if (!Array.isArray(pageData) || pageData.length === 0) {
          break;
        }

        allMessages = [...allMessages, ...pageData];
      } catch (error) {
        console.warn(`Error fetching room chat page ${page}:`, error);
        break;
      }
    }

    allMessages = allMessages.filter((item) => item.to === roomName);

    return allMessages;
  }

  /**
   * MỚI: Lấy TOÀN BỘ tin nhắn người dùng (tự động phân trang 1->100).
   * @param userName Tên người dùng
   * @returns Promise<Array> Danh sách tin nhắn thô
   */
  public async getAllPeopleChatMes(userName: string): Promise<any[]> {
    let allMessages: any[] = [];
    const MAX_PAGE = 100;

    for (let page = 1; page <= MAX_PAGE; page++) {
      try {
        const response = await this._sendAndWaitResponse(
          "GET_PEOPLE_CHAT_MES",
          { name: userName, page: page },
          EV_GET_PEOPLE_CHAT_MES,
        );

        const pageData = response.data?.data
          ? response.data.data
          : response.data;
        const list = Array.isArray(pageData) ? pageData : [];

        if (list.length === 0) {
          break;
        }

        allMessages = [...allMessages, ...list];
      } catch (error) {
        console.warn(`Error fetching people chat page ${page}:`, error);
        break;
      }
    }

    allMessages = allMessages.filter((item) => item.to === userName);
    return allMessages;
  }
}

export const CURRENT_SOCKET = new ChatSocket();
