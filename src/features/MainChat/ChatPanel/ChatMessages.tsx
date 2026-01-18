import { formatTime } from "../../../module/utlis";
import { useEffect, useRef, useState } from "react";
import { Message } from "../../../module/message_decode";
import "./ChatMessages.css";
import { ChatMessagesAction } from "./ChatMessagesAction";

export interface ChatMessageProps {
  message: Message;
  isOwner: boolean;
  onReply: (msg: Message) => void;
  onUpdate: (updatedMsg: Message) => void;
}

export function ChatMessage({
  message,
  isOwner,
  onReply,
  onUpdate,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicClassname, setDynamicClassname] = useState("");

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowActions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStart = () => {
    pressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 1000);
  };

  const handleEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const hideShowActionsFunc = () => {
    setShowActions(false);
  };
  const handleDownload = () => {
    if (!message.data) return;

    const link = document.createElement("a");
    link.href = message.data;
    link.download = message.name || `file_${message.gid}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (message.type) {
      case "text":
        return <p className="text-content">{message.data}</p>;

      case "image":
        return (
          <div className="media-wrapper">
            <img src={message.data} alt="img" className="msg-image" />
            {renderDownloadButton()}
          </div>
        );

      case "video":
        return (
          <div className="media-wrapper">
            <video controls className="msg-video">
              <source src={message.data} />
            </video>
            {renderDownloadButton()}
          </div>
        );

      case "file":
      default:
        return (
          <div className="file-wrapper">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <span className="file-name">
                {message.name || "Tệp đính kèm"}
              </span>
            </div>
            {renderDownloadButton()}
          </div>
        );
    }
  };

  const renderDownloadButton = () => (
    <button className="download-btn" onClick={handleDownload} title="Tải xuống">
      ⬇
    </button>
  );

  useEffect(() => {
    var classNameD = "message-container";

    if (isOwner) {
      classNameD += " owner";
    }

    if (message.reaction) {
      classNameD += " reaction";
    }

    if (message.can_display_name) {
      classNameD += " display-name";
    }
    setDynamicClassname(classNameD);
  }, [message, isOwner]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      className={dynamicClassname}
    >
      <div className={isOwner ? "message-content owner" : "message-content"}>
        {showActions && (
          <ChatMessagesAction
            message={message}
            isOwner={isOwner}
            onReply={onReply}
            onUpdate={onUpdate}
            hideShowActionsFunc={hideShowActionsFunc}
          />
        )}

        {message.awser_from && (
          <div className="reply-context-bubble">
            Trả lời: {message.awser_from}
          </div>
        )}
        {renderContent()}
        {message.reaction && (
          <div className="message-reaction-badge">{message.reaction}</div>
        )}

        {message.can_display_name && !isOwner && (
          <div className="message-name">
            {message.name} - {formatTime(message.time)}
          </div>
        )}
      </div>
    </div>
  );
}
