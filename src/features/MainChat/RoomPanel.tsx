import "./RoomPanel.css";
import { Sidebar } from "../chat/components/Sidebar/Sidebar";
export function RoomPanel() {
  return (
    <>
      <div className="room-container glass-eff border-radius">
          <Sidebar/>
      </div>
    
    </>
  );
}
