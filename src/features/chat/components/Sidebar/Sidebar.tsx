import React, { useState } from "react";
import "./Sidebar.css";

interface ChatItem {
  name: string;
  type: number; 
  actionTime: string;
}

export const Sidebar: React.FC = () => {
  // Dữ liệu giả để test giao diện
  const [mockList] = useState<ChatItem[]>([
    { name: "long", type: 0, actionTime: "2026-01-04 14:12:20" },
    { name: "group85 2025-2026", type: 1, actionTime: "2026-01-04 14:12:10" },
    { name: "Nguyễn Văn A", type: 0, actionTime: "2026-01-04 15:30:00" },
    { name: "Lớp Lập Trình", type: 1, actionTime: "2026-01-04 16:00:00" },
    { name: "Trần Thị B", type: 0, actionTime: "2026-01-04 17:45:00" },
  ]);

  const [activeChat, setActiveChat] = useState<string>("");

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Messenger</h2>
        <div className="search-wrapper">
          <input type="text" placeholder="Tìm kiếm trên Messenger" className="search-input" />
        </div>
      </div>

      <div className="sidebar-list">
        {mockList.map((item, index) => (
          <div 
            key={index} 
            className={`sidebar-item ${activeChat === item.name ? "active" : ""}`}
            onClick={() => setActiveChat(item.name)}
          >
            <div className="avatar-section">
              <div 
                className="avatar-circle" 
                style={{ backgroundColor: item.type === 1 ? "#0084ff" : "#44bec7" }}
              >
                {item.name.charAt(0).toUpperCase()}
              </div>
              {/* Giả lập chấm xanh online cho User (type 0) */}
              {item.type === 0 && <span className="online-badge"></span>}
            </div>

            <div className="content-section">
              <div className="content-top">
                <span className="item-name">{item.name}</span>
                <span className="item-time">{item.actionTime.split(" ")[1].substring(0, 5)}</span>
              </div>
              <div className="content-bottom">
                <span className="item-type">
                  {item.type === 1 ? "Nhóm cộng đồng" : "Bạn bè"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};