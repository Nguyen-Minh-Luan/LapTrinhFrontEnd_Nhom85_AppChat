import CryptoJS from "crypto-js";
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

interface ChunkPayload {
  realType: string;
  fileName: string;
  part: number;
  total: number;
  content: string;
}

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

export function createFileMessage(
  data: string,
  file: File,
  chunkSize: number = 1700,
): Message[] {
  const timestamp = Date.now().toString();
  const gid = CryptoJS.MD5(timestamp).toString();

  let fileType = "file";
  if (file.type.startsWith("image/")) fileType = "image";
  if (file.type.startsWith("video/")) fileType = "video";

  const totalLength = data.length;
  const totalParts = Math.ceil(totalLength / chunkSize);
  const messages: Message[] = [];

  for (let i = 0; i < totalParts; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunkContent = data.slice(start, end);

    const payload: ChunkPayload = {
      realType: fileType,
      fileName: file.name,
      part: i,
      total: totalParts,
      content: chunkContent,
    };

    messages.push({
      gid: gid,
      type: "chunk",
      data: JSON.stringify(payload),
      name: file.name,
      is_delete: false,
      reaction: "",
      awser_from: "",
      can_display_name: false,
      time: "",
    });
  }

  return messages;
}

export function messageDepack(data: any[]) {
  const processedMap = new Map();
  const chunkBuffer = new Map<
    string,
    { parts: string[]; total: number; realType: string; receivedCount: number }
  >();

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
        awser_from: "",
        time: c.createAt,
      } as any;
    }

    if (messageData.type === "chunk") {
      try {
        let payload: ChunkPayload;

        try {
          payload = JSON.parse(messageData.data);
        } catch (err) {
          continue;
        }

        const gid = messageData.gid;

        if (payload.part < 0 || payload.part >= payload.total) {
          continue;
        }

        if (!chunkBuffer.has(gid)) {
          chunkBuffer.set(gid, {
            parts: new Array(payload.total).fill(null),
            total: payload.total - 1,
            realType: payload.realType,
            receivedCount: 0,
          });
        }

        const buffer = chunkBuffer.get(gid)!;

        if (buffer.total !== payload.total - 1) {
          continue;
        }

        if (buffer.parts[payload.part] === null) {
          buffer.parts[payload.part] = payload.content;
          buffer.receivedCount++;
        }

        if (buffer.receivedCount === buffer.total) {
          const fullData = buffer.parts.join("");

          messageData.type = buffer.realType;
          messageData.data = fullData;

          chunkBuffer.delete(gid);
        } else {
          continue;
        }
      } catch (err) {
        console.error("Error processing chunk:", err);
        continue;
      }
    }

    if (processedMap.has(messageData.gid)) {
      const existing = processedMap.get(messageData.gid);
      existing.data.is_delete = messageData.is_delete;
      existing.data.reaction = messageData.reaction;
      existing.data.awser_from = messageData.awser_from;

      if (messageData.type !== "text" && messageData.data) {
        existing.data.data = messageData.data;
        existing.data.type = messageData.type;
      }
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
