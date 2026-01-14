import { CURRENT_SOCKET } from "../../module/appsocket";
import { useAppDispatch, useAppSelector } from "../../hook/customHook";
import "./Navbar.css";
import { logout } from "../../redux/authSlice";
import { useSearchParams } from "react-router-dom";
export function Navbar() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const [searchParams] = useSearchParams();

  const currentRoom = searchParams.get("roomid");
  const currentUser = searchParams.get("user");

  return (
    <>
      <div className="navbar glass-eff border-radius dropshadow">
        <div className="flex flex-grow full-width">
          <div className="flex navbar-left"></div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="navbar-center">
          {currentRoom ? `Nhóm: ${currentRoom}` : `Đến: ${currentUser}`}
        </div>
      </div>
    </>
  );
}
