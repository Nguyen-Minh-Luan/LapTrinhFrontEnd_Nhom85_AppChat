import "./ChatPanel.css";
import { ChatMessage } from "./ChatPanel/ChatMessages.tsx";

export function ChatPanel() {
  return (
    <>
      <div className="chat-panel flex">
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
    </>
  );
}
