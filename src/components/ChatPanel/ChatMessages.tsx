import "./ChatMessages.css";

export function ChatMessage({ message, isOwner }) {
  return (
    <>
      <div
        className={isOwner ? "message-container owner" : "message-container"}
      >
        <div
          className={isOwner ? "message-content owner" : "message-content"}
          dangerouslySetInnerHTML={{ __html: message }}
        ></div>
      </div>
    </>
  );
}
