import {
  ChatResponse,
  CURRENT_SOCKET,
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
} from "../../module/message_decode";

interface UploadedFile {
  file: File;
  preview: string;
}

export function ChatPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mess, setMess] = useState([]);
  const chatInput = useRef<HTMLInputElement>(null);
  const targetDropZone = useRef<HTMLDivElement>(null);
  const fileDropZone = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

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
  const processFiles = async (uploadedFiles: File[]) => {
    const filePromises = uploadedFiles.map((file) => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            file: file,
            preview: event.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newFiles = await Promise.all(filePromises);

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  CURRENT_SOCKET.onMessageReceiveds.push((data: ChatResponse) => {
    if (data.event === EV_GET_ROOM_CHAT_MES) {
      const processedMap = new Map();

      for (var c of data.data.chatData) {
        var rawData = c.mes;

        try {
          var messageData: Message = JSON.parse(rawData);

          if (!messageData || !messageData.gid) continue;

          if (messageData.is_delete === true) continue;

          if (!processedMap.has(messageData.gid)) {
            processedMap.set(messageData.gid, {
              id: messageData.gid,
              name: c.name,
              time: c.createAt,
              data: messageData,
              isOwer: c.name === GLOBAL_VALUE.username,
            });
          }
        } catch (e) {
          continue;
        }
      }

      const message_data = Array.from(processedMap.values());

      message_data.reverse();

      setMess(message_data);
    }

    console.log(data);
  });

  const currentRoom = searchParams.get("roomid");
  CURRENT_SOCKET.onConnecteds.push(() => {
    CURRENT_SOCKET.login(GLOBAL_VALUE.username, GLOBAL_VALUE.password);
    CURRENT_SOCKET.getRoomChatMes(currentRoom);
  });

  function sendFile(room: string, fileItem: UploadedFile) {
    return new Promise((resolve) => {
      CURRENT_SOCKET.sendChatToRoom(
        currentRoom,
        JSON.stringify(createFileMessage(fileItem.preview, fileItem.file)),
      );

      setTimeout(() => {
        resolve(null);
      }, 500);
    });
  }

  async function sendChat() {
    if (chatInput.current.value !== "") {
      CURRENT_SOCKET.sendChatToRoom(
        currentRoom,
        JSON.stringify(createMessage(chatInput.current.value)),
      );
      chatInput.current.value = "";
    }

    if (files.length > 0) {
      const filesToSend = [...files];
      for (const fileItem of filesToSend) {
        await sendFile(currentRoom, fileItem);
      }
      setFiles([]);
    }

    CURRENT_SOCKET.getRoomChatMes(currentRoom);
  }

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
            ></ChatMessage>
          ))}
        </div>

        <div className="preview-area border-radius flex">
          {files.map((fileItem, index) => (
            <FilePreview
              key={index}
              base64data={fileItem.preview}
              onRemove={() => handleRemoveFile(index)}
            ></FilePreview>
          ))}
        </div>

        <div className="glass-eff border-radius chat-input-container">
          <input
            ref={chatInput}
            type="text"
            placeholder="Nhập tin nhắn..."
            className="chat-input"
          />
          <button className="btn send-button" onClick={sendChat}>
            Gửi
          </button>
        </div>
      </div>
    </>
  );
}
