import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hook/customHook";
import { setUserList, setActiveChat, updateLastMessage } from "../../../../redux/sidebarSlice";
import { CURRENT_SOCKET } from "../../../../module/appsocket";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userList, activeChat } = useAppSelector((state) => state.siderBar);
  const { isLogin } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLogin) return;

    CURRENT_SOCKET.onMessageReceived = (data: any) => {
      if (data.status === "success") {
        if (data.event === "GET_USER_LIST") {
          dispatch(setUserList(data.data));
          data.data.forEach((item: any) => {
            if (item.type === 1) CURRENT_SOCKET.getRoomChatMes(item.name);
            else CURRENT_SOCKET.getPeopleChatMes(item.name);
          });
        }

        const isHistory = data.event === "GET_ROOM_CHAT_MES" || data.event === "GET_PEOPLE_CHAT_MES";
        const isRealtime = data.event === "CHAT" || data.event === "SEND_CHAT";

        if (isHistory || isRealtime) {
          let name = "";
          let mes = "";

          if (data.event === "GET_ROOM_CHAT_MES") {
            const last = data.data.chatData?.[0];
            if (last) { name = data.data.name; mes = `${last.name}: ${last.mes}`; }
          } else if (data.event === "GET_PEOPLE_CHAT_MES") {
            const last = data.data?.[0];
            if (last) { name = last.to === "22130193" ? last.name : last.to; mes = last.mes; }
          } else if (isRealtime) {
            const msg = data.data;
            name = msg.type === 1 ? msg.to : (msg.name === "22130193" ? msg.to : msg.name);
            mes = msg.type === 1 ? `${msg.name}: ${msg.mes}` : msg.mes;
          }

          if (name) {
            dispatch(updateLastMessage({ name, mes, isRealtime: isRealtime }));
          }
        }
      }
    };

    const init = async () => {
      if (!CURRENT_SOCKET.isConnect()) await CURRENT_SOCKET.connect();
      CURRENT_SOCKET.getUserList();
    };
    init();
  }, [isLogin, dispatch]);

  const filteredList = userList?.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Messages</h2>
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sidebar-list">
        {filteredList?.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${activeChat?.name === item.name ? "active" : ""} ${item.isUnread ? "has-unread" : ""}`}
            onClick={() => {
              dispatch(setActiveChat(item));
              if (item.type === 1) CURRENT_SOCKET.getRoomChatMes(item.name);
              else CURRENT_SOCKET.getPeopleChatMes(item.name);
            }}
          >
            <div className="avatar-section">
              <div 
                className="avatar-circle" 
                style={{ background: item.type === 1 ? "linear-gradient(135deg, #0084ff, #00c6ff)" : "linear-gradient(135deg, #44bec7, #3498db)" }}
              >
                {item.name?.charAt(0).toUpperCase()}
              </div>
              {item.type === 0 && <div className="online-badge"></div>}
            </div>

            <div className="content-section">
              <div className="content-top">
                <div className="name-and-type">
                  <span className={`item-name ${item.isUnread ? "bold" : ""}`}>{item.name}</span>
                  <span className={`type-tag ${item.type === 1 ? "group-tag" : "user-tag"}`}>
                    {item.type === 1 ? "Group" : "User"}
                  </span>
                </div>
                <span className="item-time">
                  {item.actionTime?.split(" ")[1]?.substring(0, 5) || "Vừa xong"}
                </span>
              </div>
              <div className="content-bottom">
                <p className={`last-message ${item.isUnread ? "highlight" : ""}`}>
                  {item.lastMes || "No messages yet"}
                </p>
                {item.unreadCount > 0 && <div className="unread-badge">{item.unreadCount}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};