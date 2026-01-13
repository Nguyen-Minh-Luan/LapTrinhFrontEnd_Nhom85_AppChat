import { CURRENT_SOCKET } from "../../module/appsocket";
import { useAppDispatch, useAppSelector } from "../../hook/customHook";
import "./Navbar.css";
import { logout } from "../../redux/authSlice";
export function Navbar() {
  const dispatch = useAppDispatch()


  const handleLogout = async() =>{
    await dispatch(logout())
  }
  
  return (
    <>
      <div className="navbar glass-eff border-radius dropshadow">
        <div className="flex flex-grow full-width">
          <div className="flex navbar-left">Home</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="navbar-center">Nav</div>
      </div>
    </>
  );
}
