import {
  ChatResponse,
  CURRENT_SOCKET,
  EV_GET_PEOPLE_CHAT_MES,
  EV_GET_ROOM_CHAT_MES,
  EV_SEND_CHAT,
} from "../../module/appsocket";
import { use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import "./ChatPanel.css";
import { ChatMessage } from "./ChatPanel/ChatMessages";
import { GLOBAL_VALUE } from "../../module/global_value";
import { DragEventHandler, DragEvent } from "react";
import { FilePreview } from "./ChatPanel/FilePreview";
import {
  createFileMessage,
  createMessage,
  encodeEmoji,
  Message,
  messageDepack,
} from "../../module/message_decode";
import { data } from "react-router-dom";

interface UploadedFile {
  file: File;
  preview: string;
}

const getCurrentTimeStr = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

export function ChatPanel() {
  const [searchParams] = useSearchParams();

  const [mess, setMess] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [rawMessagesList, setRawMessagesList] = useState<any[]>([]);

  const chatInput = useRef<HTMLInputElement>(null);
  const targetDropZone = useRef<HTMLDivElement>(null);
  const fileDropZone = useRef<HTMLDivElement>(null);

  const currentRoom = searchParams.get("roomid");
  const currentUser = searchParams.get("user");
  const fetchMessages = async () => {
    try {
      let rawMessages = [];
      if (currentRoom) {
        rawMessages = await CURRENT_SOCKET.getAllRoomChatMes(currentRoom);
      } else if (currentUser) {
        rawMessages = await CURRENT_SOCKET.getAllPeopleChatMes(currentUser);
      }
      if (Array.isArray(rawMessages)) {
        setRawMessagesList(rawMessages);
        setMess(messageDepack(rawMessages));

        const decode = messageDepack(rawMessages);

        setMess(messageDepack(rawMessages));
        console.log(decode);
      }
    } catch (e) {
      console.error("Lỗi tải tin nhắn:", e);
    }
  };

  useEffect(() => {
    CURRENT_SOCKET.addMessageReceived(
      "CHAT",
      (id: string, data: ChatResponse) => {
        if (id !== "CHAT") {
          return;
        }

        if (data.event === EV_SEND_CHAT) {
          const newRawMsg = data.data;

          if (!newRawMsg.createAt) {
            newRawMsg.createAt = getCurrentTimeStr();
          }

          setRawMessagesList((prevRaw) => {
            const newRawList = [newRawMsg, ...prevRaw];

            setMess(messageDepack(newRawList));
            // console.log(decode);
            return newRawList;
          });
        }
      },
    );

    fetchMessages();

    return () => {
      CURRENT_SOCKET.removeMessageReceived("CHAT");
    };
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
    } else if (currentUser) {
      CURRENT_SOCKET.sendChatToPeople(currentUser, payload);
    }

    const localRawMsg = {
      mes: payload,
      name: GLOBAL_VALUE.username(),
      type: currentRoom ? 1 : 0,
      createAt: getCurrentTimeStr(),
    };

    setRawMessagesList((prevRaw) => {
      const newRawList = [localRawMsg, ...prevRaw];
      const decode = messageDepack(newRawList);
      setMess(decode);
      // console.log(decode);
      return newRawList;
    });
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
        for (let m of msg) {
          await new Promise((r) => setTimeout(r, 100));
          await sendData(JSON.stringify(m), true);
        }
      }
      setFiles([]);
      fetchMessages();
    }
  };

  const handleUpdateMessage = (updatedMsg: Message) => {
    updatedMsg.reactionIdx = encodeEmoji(updatedMsg.reaction);
    updatedMsg.reaction = "";
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
              key={messData.id}
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

        {replyingTo && (
          <div className="glass-eff border-radius chat-input-container">
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
          </div>
        )}

        <div className="glass-eff border-radius chat-input-container">
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
