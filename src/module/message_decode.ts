import CryptoJS from "crypto-js";
import { ChatResponse } from "./appsocket";
import { GLOBAL_VALUE } from "./global_value";

export interface Message {
  gid: string;
  type: string;
  data: string;
  name: string | null;
  is_delete: boolean;
  reaction: string;
  awser_from: string;
  can_display_name: boolean;
  time: string;
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
    awser_from: "",
    can_display_name: false,
    time: "",
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
    awser_from: "",
    can_display_name: false,
    time: "",
  };
}

export function messageDepack(data: any[]) {
  const processedMap = new Map();
  const chatData = [...data];
  chatData.reverse();
  for (var c of chatData) {
    var rawData = c.mes;
    let messageData: Message;

    try {
      messageData = JSON.parse(rawData);

      if (!messageData || !messageData.gid) {
        throw new Error("Invalid message format");
      }
    } catch (e) {
      messageData = {
        gid: c.id.toString(),
        type: "text",
        data: rawData,
        name: c.name,
        is_delete: false,
        reaction: "",
        time: c.createAt,
      } as any;
    }

    if (processedMap.has(messageData.gid)) {
      const existing = processedMap.get(messageData.gid);

      existing.data.is_delete = messageData.is_delete;
      existing.data.reaction = messageData.reaction;
      existing.data.awser_from = messageData.awser_from;

      existing.data.data = messageData.data;
    } else {
      processedMap.set(messageData.gid, {
        id: messageData.gid,
        name: c.name,
        time: c.createAt,
        data: messageData,
        isOwer: c.name === GLOBAL_VALUE.username(),
      });
    }
  }

  let message_list = Array.from(processedMap.values());

  message_list = message_list.filter((item) => !item.data.is_delete);

  const TIME_THRESHOLD = 10 * 60 * 1000;

  for (let i = 0; i < message_list.length; i++) {
    const currentMsg = message_list[i];
    const nextMsg = message_list[i + 1];

    currentMsg.data.can_display_name = false;

    if (!nextMsg) {
      currentMsg.data.can_display_name = true;
      continue;
    }

    if (currentMsg.name !== nextMsg.name) {
      currentMsg.data.can_display_name = true;
      continue;
    }

    const currentTime = new Date(currentMsg.time).getTime();
    const nextTime = new Date(nextMsg.time).getTime();

    if (!isNaN(currentTime) && !isNaN(nextTime)) {
      if (nextTime - currentTime > TIME_THRESHOLD) {
        currentMsg.data.can_display_name = true;
      }
    }
  }

  return message_list;
}
