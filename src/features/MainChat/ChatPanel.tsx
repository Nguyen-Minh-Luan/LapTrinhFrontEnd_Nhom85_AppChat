import { DragEventHandler, DragEvent, useState } from "react";
import "./ChatPanel.css";
import { ChatMessage } from "./ChatPanel/ChatMessages";

export function ChatPanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver: DragEventHandler<HTMLDivElement> = (
    e: DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const uploadedFiles = Array.from(e.dataTransfer.files);
    if (uploadedFiles.length > 0) {
      processFiles(uploadedFiles);
    }
  };
  const processFiles = (uploadedFiles: File[]) => {
    uploadedFiles.forEach((file) => {
      console.log("Đã nhận file:", file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        console.log("Nội dung file:", event.target?.result);
      };
      reader.readAsDataURL(file);
    });
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };
  return (
    <>
      <div
        className="chat-panel flex"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="chat-message-display-area glass-eff border-radius">
          <ChatMessage message={"Xin chào"} isOwner={false}></ChatMessage>
          <ChatMessage message={"<p>Hi</p>"} isOwner={true}></ChatMessage>
          <ChatMessage
            message={`<img src="https://sigura.lan/api/v2/media/storage/f58b0697502e1319e5b0c800c2c785a7.webp" />`}
            isOwner={true}
          ></ChatMessage>
        </div>

        <div className="glass-eff border-radius chat-input-container">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="chat-input"
          />
          <button className="btn send-button">Gửi</button>
        </div>
      </div>
      {isDragging && (
        <div className="file-drop-container">
          <p>Thả file vào để gửi!</p>
        </div>
      )}
    </>
  );
}
