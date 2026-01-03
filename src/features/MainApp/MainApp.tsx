import { Backdrop } from "../MainChat/Backdrop";
import { ChatPanel } from "../MainChat/ChatPanel";
import { RoomPanel } from "../MainChat/RoomPanel";
import { Navbar } from "../Navbar/Navbar";

export function MainApp() {
  return (
    <>
      <Backdrop imageUrl="https://sigura.lan/api/v2/media/storage/e99d89888a88c1a83c6a4e0f7c85c3a2.webp" />
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Navbar />

        <div style={{ display: "flex", flexGrow: 1 }}>
          <div
            style={{
              width: "450px",
              flexShrink: 0,
              height: "90vh",
              padding: "0.25rem",
            }}
          >
            <RoomPanel></RoomPanel>
          </div>
          <div
            style={{
              flexGrow: 1,
              height: "90vh",
              padding: "0.25rem",
            }}
          >
            <ChatPanel></ChatPanel>
          </div>
        </div>
      </div>
    </>
  );
}
