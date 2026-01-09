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
        
        if (data.event === "GET_USER_LIST") {
          dispatch(setUserList(data.data));
          data.data.forEach((item: any) => {
            if (item.type === 1) CURRENT_SOCKET.getRoomChatMes(item.name);
            else CURRENT_SOCKET.getPeopleChatMes(item.name);
          });
        }

        if (data.event === "GET_ROOM_CHAT_MES") {
          const groupInfo = data.data; 
          const chatData = groupInfo.chatData;
          if (chatData && chatData.length > 0) {
            const newest = chatData[0];
            dispatch(updateLastMessage({
              name: groupInfo.name, 
              mes: `${newest.name}: ${newest.mes}`
            }));
          }
        }

        if (data.event === "GET_PEOPLE_CHAT_MES") {
          const messages = data.data;
          if (messages && messages.length > 0) {
            const newest = messages[0];
            const partnerName = (newest.to === "22130193") ? newest.name : newest.to;
            dispatch(updateLastMessage({
              name: partnerName,
              mes: newest.mes
            }));
          }
        }

        if (data.event === "CHAT" || data.event === "SEND_CHAT") {
          const newMes = data.data;
          
          if (newMes.type === 1) {
            dispatch(updateLastMessage({
              name: newMes.to,
              mes: `${newMes.name}: ${newMes.mes}`
            }));
          } else {
            const partnerName = (newMes.name === "22130193") ? newMes.to : newMes.name;
            dispatch(updateLastMessage({
              name: partnerName,
              mes: newMes.mes
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
                  {item.actionTime?.split(" ")[1]?.substring(0, 5) || "Vừa xong"}
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