import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hook/customHook";
import { setUserList, setActiveChat, updateLastMessage } from "../../../../redux/sidebarSlice";
import { CURRENT_SOCKET } from "../../../../module/appsocket";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userList, activeChat } = useAppSelector((state) => state.siderBar);
  const { isLogin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLogin) return;

    CURRENT_SOCKET.onMessageReceived = (data: any) => {
      if (data.status === "success") {
        // 1. Nhận danh sách người dùng/nhóm ban đầu
        if (data.event === "GET_USER_LIST") {
          dispatch(setUserList(data.data));
          // Tự động kéo tin nhắn cũ để hiện Last Message
          data.data.forEach((item: any) => {
            if (item.type === 1) CURRENT_SOCKET.getRoomChatMes(item.name);
            else CURRENT_SOCKET.getPeopleChatMes(item.name);
          });
        }

        // 2. Xử lý tin nhắn NHÓM (Dữ liệu nằm trong data.data.chatData)
        if (data.event === "GET_ROOM_CHAT_MES") {
          const groupInfo = data.data; 
          const chatData = groupInfo.chatData;
          if (chatData && chatData.length > 0) {
            const newest = chatData[0]; // Tin nhắn "sd"
            dispatch(updateLastMessage({
              name: groupInfo.name, // "group85 2025-2026"
              mes: `${newest.name}: ${newest.mes}` // Hiển thị "22130193: sd"
            }));
          }
        }

        // 3. Xử lý tin nhắn CÁ NHÂN (Dữ liệu nằm trực tiếp trong data.data)
        if (data.event === "GET_PEOPLE_CHAT_MES") {
          const messages = data.data;
          if (messages && messages.length > 0) {
            const newest = messages[0];
            // Partner là người mình đang chat cùng (to hoặc name)
            const partnerName = (newest.to === "22130193") ? newest.name : newest.to;
            dispatch(updateLastMessage({
              name: partnerName,
              mes: newest.mes
            }));
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

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Messages</h2>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="sidebar-list">
        {userList?.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${activeChat?.name === item.name ? "active" : ""}`}
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
                  <span className="item-name">{item.name}</span>
                  <span className={`type-tag ${item.type === 1 ? "group-tag" : "user-tag"}`}>
                    {item.type === 1 ? "Group" : "User"}
                  </span>
                </div>
                <span className="item-time">
                  {item.actionTime?.split(" ")[1]?.substring(0, 5) || "10:00"}
                </span>
              </div>
              <div className="content-bottom">
                <p className="last-message">
                  {item.lastMes || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};