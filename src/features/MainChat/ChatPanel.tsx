import {
  ChatResponse,
  CURRENT_SOCKET,
  EV_GET_PEOPLE_CHAT_MES,
  EV_GET_ROOM_CHAT_MES,
} from "../../module/appsocket";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import "./ChatPanel.css";
import { ChatMessage } from "./ChatPanel/ChatMessages";
import { GLOBAL_VALUE } from "../../module/global_value";
import { DragEventHandler, DragEvent } from "react";
import { FilePreview } from "./ChatPanel/FilePreview";
import {
  createFileMessage,
  createMessage,
  Message,
  messageDepack,
} from "../../module/message_decode";

interface UploadedFile {
  file: File;
  preview: string;
}

export function ChatPanel() {
  const LISTENER_ID = "ChatPanel_Listener";
  const [searchParams] = useSearchParams();

  const [mess, setMess] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const chatInput = useRef<HTMLInputElement>(null);
  const targetDropZone = useRef<HTMLDivElement>(null);
  const fileDropZone = useRef<HTMLDivElement>(null);

  const currentRoom = searchParams.get("roomid");
  const currentUser = searchParams.get("user");

  useEffect(() => {
    const handleSocketMessage = (id: string, data: ChatResponse) => {
      if (!data) return;
      if (id !== LISTENER_ID) return;

      let rawList: any[] = [];
      let shouldUpdate = false;
      if (
        data.event === EV_GET_ROOM_CHAT_MES &&
        currentRoom &&
        currentRoom === data.data["name"]
      ) {
        rawList = data.data?.chatData || [];
        shouldUpdate = true;
      } else if (data.event === EV_GET_PEOPLE_CHAT_MES && currentUser) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          if (data.data[0].to === currentUser) rawList = data.data;
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        const processedMessages = messageDepack(rawList);
        setMess(processedMessages);
      }
    };

    CURRENT_SOCKET.addMessageReceived(LISTENER_ID, handleSocketMessage);

    const fetchData = async () => {
      if (!CURRENT_SOCKET.isConnect()) {
      } else {
        if (currentRoom) CURRENT_SOCKET.getRoomChatMes(currentRoom);
        if (currentUser) CURRENT_SOCKET.getPeopleChatMes(currentUser);
      }
    };
    fetchData();

    return () => {
      CURRENT_SOCKET.removeMessageReceived(LISTENER_ID);
    };
  }, [currentUser, currentRoom, LISTENER_ID]);

  useEffect(() => {
    const handleConnect = async () => {
      await CURRENT_SOCKET.reLogin(
        GLOBAL_VALUE.username(),
        await GLOBAL_VALUE.relogincode(),
      );

      if (currentRoom) CURRENT_SOCKET.getRoomChatMes(currentRoom);
      if (currentUser) CURRENT_SOCKET.getPeopleChatMes(currentUser);
    };

    CURRENT_SOCKET.onConnecteds.push(handleConnect);
    if (CURRENT_SOCKET.isConnect()) handleConnect();
  }, [currentRoom, currentUser]);

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (
      e.relatedTarget &&
      !targetDropZone.current?.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFiles = Array.from(e.dataTransfer.files);
    if (uploadedFiles.length > 0) {
      const newFiles = await Promise.all(
        uploadedFiles.map(
          (file) =>
            new Promise<UploadedFile>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) =>
                resolve({ file, preview: ev.target?.result as string });
              reader.readAsDataURL(file);
            }),
        ),
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const sendData = async (payload: string, isFile: boolean = false) => {
    if (currentRoom) {
      CURRENT_SOCKET.sendChatToRoom(currentRoom, payload);
      if (!isFile) CURRENT_SOCKET.getRoomChatMes(currentRoom);
    } else if (currentUser) {
      CURRENT_SOCKET.sendChatToPeople(currentUser, payload);
      if (!isFile) CURRENT_SOCKET.getPeopleChatMes(currentUser);
    }
  };

  const sendChat = async () => {
    if (!chatInput.current) return;
    const text = chatInput.current.value;

    if (text !== "") {
      const newMsg = createMessage(text);
      if (replyingTo) {
        let replyContent = replyingTo.data;
        if (replyingTo.type !== "text") replyContent = `[${replyingTo.type}]`;
        newMsg.awser_from =
          replyContent.length > 30
            ? replyContent.substring(0, 30) + "..."
            : replyContent;
      }
      await sendData(JSON.stringify(newMsg));
      chatInput.current.value = "";
      setReplyingTo(null);
    }

    if (files.length > 0) {
      for (const fileItem of files) {
        const msg = createFileMessage(fileItem.preview, fileItem.file);
        await new Promise((r) => setTimeout(r, 3000));
        await sendData(JSON.stringify(msg), true);
      }
      setFiles([]);
      if (currentRoom) CURRENT_SOCKET.getRoomChatMes(currentRoom);
      if (currentUser) CURRENT_SOCKET.getPeopleChatMes(currentUser);
    }
  };

  const handleUpdateMessage = (updatedMsg: Message) => {
    sendData(JSON.stringify(updatedMsg));
  };

  useEffect(() => {
    if (fileDropZone.current && targetDropZone.current) {
      const rect = targetDropZone.current.getBoundingClientRect();
      fileDropZone.current.style.width = `${rect.width}px`;
      fileDropZone.current.style.height = `${rect.height}px`;
    }
  });

  return (
    <>
      {isDragging && (
        <div className="file-drop" ref={fileDropZone}>
          <p>Thả file vào để gửi!</p>
        </div>
      )}

      <div
        className="chat-panel flex"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={targetDropZone}
      >
        <div className="chat-message-display-area glass-eff border-radius">
          {mess.map((messData: any) => (
            <ChatMessage
              key={messData.id} // ID này là GID hoặc Server ID
              message={messData.data}
              isOwner={messData.isOwer}
              onUpdate={handleUpdateMessage}
              onReply={(msg) => {
                setReplyingTo(msg);
                chatInput.current?.focus();
              }}
            />
          ))}
        </div>

        {/* Khu vực Preview File */}
        <div className="preview-area border-radius flex">
          {files.map((fileItem, index) => (
            <FilePreview
              key={index}
              base64data={fileItem.preview}
              onRemove={() =>
                setFiles((prev) => prev.filter((_, i) => i !== index))
              }
            />
          ))}
        </div>

        {/* Input Area */}
        <div className="glass-eff border-radius chat-input-container">
          {replyingTo && (
            <div className="reply-indicator">
              <div className="reply-content">
                Đang trả lời:{" "}
                <strong>
                  {replyingTo.type === "text"
                    ? replyingTo.data.length > 30
                      ? replyingTo.data.substring(0, 30) + "..."
                      : replyingTo.data
                    : `[File ${replyingTo.type}]`}
                </strong>
              </div>
              <button
                className="close-reply-btn"
                onClick={() => setReplyingTo(null)}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
            <input
              ref={chatInput}
              type="text"
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <button className="btn send-button" onClick={sendChat}>
              Gửi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
