import { Message } from "../../../module/message_decode";
import "./ChatMessages.css";

export interface ChatMessageProps {
  message: Message;
  isOwner: boolean;
}

export function ChatMessage({ message, isOwner }: ChatMessageProps) {
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

  return (
    <div className={isOwner ? "message-container owner" : "message-container"}>
      <div className={isOwner ? "message-content owner" : "message-content"}>
        {renderContent()}
      </div>
    </div>
  );
}
