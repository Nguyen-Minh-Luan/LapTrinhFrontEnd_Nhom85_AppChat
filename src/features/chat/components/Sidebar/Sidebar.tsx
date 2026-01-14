import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hook/customHook";
import { setUserList, setActiveChat, updateLastMessage } from "../../../../redux/sidebarSlice";
import { decryptToken } from "../../../../module/encryption";
import { CURRENT_SOCKET } from "../../../../module/appsocket";
import "./Sidebar.css";

const formatRelativeTime = (timeStr: string | undefined) => {
  if (!timeStr) return "";

  const date = new Date(timeStr.replace(/-/g, "/"));
  const now = new Date();

  if (isNaN(date.getTime())) return "";

  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (diffInHours < 12 && diffInHours >= 0) {
    return `${hours}:${minutes}`;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMsgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffInDays = Math.floor((startOfToday - startOfMsgDay) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return `${hours}:${minutes}`;
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 8) return `${diffInDays} ngày trước`;

  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userList, activeChat } = useAppSelector((state) => state.siderBar);
  const { isLogin, username } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLogin) return;

    const processMessage = async (rawData: string, senderName: string, isRealtime: boolean, apiTime: string, targetName: string) => {
  try {
    let displayContent = "";
    const myName = username || "";

    if (rawData.startsWith('{') || rawData.startsWith('[')) {
      try {
        let msgObj: any;
        const parsedData = JSON.parse(rawData);

        if (Array.isArray(parsedData)) {
          msgObj = parsedData[0]; 
        } else {
          msgObj = parsedData;
        }

        const msgType = msgObj.type?.toUpperCase();

        if (msgType === "IMAGE") {
          displayContent = "[Hình ảnh]";
        } else if (msgType === "VIDEO") {
          displayContent = "[Video]";
        } else if (msgType === "TEXT") {
          try {
            displayContent = await decryptToken(msgObj.content || msgObj.data);
          } catch {
            displayContent = msgObj.content || msgObj.data || "";
          }
        } else {
          displayContent = "[Tệp đính kèm]";
        }
      } catch (e) {
        displayContent = rawData.substring(0, 30);
      }
    } else {
      displayContent = rawData;
    }

    const shortContent = displayContent.length > 50 
      ? displayContent.substring(0, 50) + "..." 
      : displayContent;

    const finalMes = `${senderName === myName ? "Bạn: " : ""}${shortContent}`;

    dispatch(updateLastMessage({
      name: targetName,
      mes: finalMes,
      isRealtime: isRealtime,
      actionTime: apiTime
    }));
  } catch (error) {
    console.error("Lỗi xử lý sidebar:", error);
  }
};

    const handleMessage = (data: any) => {
      if (data.status === "success") {
        if (data.event === "GET_USER_LIST") {
          dispatch(setUserList(data.data));
          data.data.forEach((item: any) => {
            if (item.type === 1) CURRENT_SOCKET.getRoomChatMes(item.name);
            else CURRENT_SOCKET.getPeopleChatMes(item.name);
          });
        }

        const isHistory = data.event === "GET_ROOM_CHAT_MES" || data.event === "GET_PEOPLE_CHAT_MES";
        const isRealtime = data.event === "SEND_CHAT";

        if (isHistory || isRealtime) {
          const myName = username || "";

          if (data.event === "GET_ROOM_CHAT_MES") {
            const last = data.data.chatData?.[0];
            if (last) {
              processMessage(last.mes, last.name, false, last.createAt, data.data.name);
            }
          }
          else if (data.event === "GET_PEOPLE_CHAT_MES") {
            const last = data.data?.[0];
            if (last) {
              const targetName = last.name === myName ? last.to : last.name;
              processMessage(last.mes, last.name, false, last.createAt, targetName);
            }
          }
          else if (isRealtime) {
            const msg = data.data;
            const targetName = msg.type === 1 ? msg.to : (msg.name === myName ? msg.to : msg.name);
            processMessage(msg.mes, msg.name, true, msg.createAt, targetName);
          }
        }
      }
    };

    CURRENT_SOCKET.onMessageReceiveds.push(handleMessage);

    const init = async () => {
      if (!CURRENT_SOCKET.isConnect()) await CURRENT_SOCKET.connect();
      CURRENT_SOCKET.getUserList();
    };
    init();

    return () => {
      CURRENT_SOCKET.onMessageReceiveds = CURRENT_SOCKET.onMessageReceiveds.filter(fn => fn !== handleMessage) as any;
    };
  }, [isLogin, username, dispatch]);

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
        {filteredList?.map((item) => (
          <div
            key={item.name}
            className={`sidebar-item ${activeChat?.name === item.name ? "active" : ""} ${item.isUnread ? "has-unread" : ""}`}
            onClick={() => {
              dispatch(setActiveChat(item));
              navigate(`/home?roomid=${encodeURIComponent(item.name)}`);
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
                  {formatRelativeTime(item.actionTime)}
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