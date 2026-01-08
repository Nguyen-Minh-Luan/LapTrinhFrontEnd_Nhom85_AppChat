import CryptoJS from "crypto-js";

export interface Message {
  gid: string;
  type: string;
  data: string;
  name: string | null;
  is_delete: boolean;
  reaction: string;
}

// Hàm tạo tin nhắn văn bản
export function createMessage(mess: string): Message {
  const timestamp = Date.now().toString();
  return {
    gid: CryptoJS.MD5(timestamp).toString(),
    type: "text",
    data: mess,
    name: null,
    is_delete: false,
    reaction: "",
  };
}

export function createFileMessage(data: string, file: File): Message {
  const timestamp = Date.now().toString();

  let fileType = "file";
  if (file.type.startsWith("image/")) fileType = "image";
  if (file.type.startsWith("video/")) fileType = "video";

  return {
    gid: CryptoJS.MD5(timestamp).toString(),
    type: fileType,
    data: data,
    name: file.name,
    is_delete: false,
    reaction: "",
  };
}
