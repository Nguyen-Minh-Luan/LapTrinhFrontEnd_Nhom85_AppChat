import { Message } from "module/message_decode";
import "./ChatMessagesAction.css";

export interface ChatMessageActionProps {
  message: Message;
  isOwner: boolean;
  onReply: (msg: Message) => void;
  onUpdate: (updatedMsg: Message) => void;
  hideShowActionsFunc: () => void;
}

export function ChatMessagesAction({
  message,
  isOwner,
  onReply,
  onUpdate,
  hideShowActionsFunc,
}: ChatMessageActionProps) {
  const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

  const handleReaction = (emoji: string) => {
    const newReaction = message.reaction === emoji ? "" : emoji;

    const updatedMsg = { ...message, reaction: newReaction };
    onUpdate(updatedMsg);
    hideShowActionsFunc();
  };

  const handleDelete = () => {
    const updatedMsg = { ...message, is_delete: true };
    onUpdate(updatedMsg);
    hideShowActionsFunc();
  };

  const handleReplyAction = () => {
    onReply(message);
    hideShowActionsFunc();
  };

  return (
    <>
      <div
        className={
          isOwner ? "action-menu-overlay" : "action-menu-overlay owner"
        }
      >
        <div className="reaction-list">
          {REACTIONS.map((emoji) => (
            <span
              key={emoji}
              className="reaction-item"
              onClick={() => handleReaction(emoji)}
              style={{ opacity: message.reaction === emoji ? 1 : 0.6 }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <button className="action-btn" onClick={handleReplyAction}>
          Trả lời
        </button>

        {isOwner && (
          <button className="action-btn delete" onClick={handleDelete}>
            Xóa
          </button>
        )}
      </div>
    </>
  );
}
