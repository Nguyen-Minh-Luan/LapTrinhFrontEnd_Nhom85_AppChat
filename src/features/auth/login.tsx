import React, {useEffect, useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { CURRENT_SOCKET } from "../../module/appsocket";
import {useAppDispatch,useAppSelector} from "../../hook/customHook"
import { login} from "../../redux/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const state = useAppSelector((state)=>state.auth)
  const [formData, setFormData] = useState({
    user: "",
    pass: "",
    // rememberMe: false,
  });
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        await dispatch(login(formData))
        console.log("isLogin = " + state.isLogin);
        if(state.isLogin){
          navigate("/home")
        }
      };
    useEffect(()=>{
        CURRENT_SOCKET.onConnected = ()=>{
          console.log("Socket Connected");
        }
        CURRENT_SOCKET.onError = (error)=>{
          console.error("Socket error", error);
        }
        CURRENT_SOCKET.onClosed = ()=>{
          console.log("Socket Closed");
        }
        return ()=>{
          CURRENT_SOCKET.onConnected = null;
          CURRENT_SOCKET.onMessageReceived = null;
          CURRENT_SOCKET.onError = null;
          CURRENT_SOCKET.onClosed = null;

        }
    },[])
    useEffect(()=>{
      console.log("login isLoading = " + state.isLoading)
    },[state.isLoading])
    useEffect(()=>{
      console.log("login isLogin = " + state.isLogin)
    },[state.isLogin])
      return (
        
        <div className="login-wrapper">
          <div className="login-container">
            <h1 className="main-title">Login to App Chat</h1>

            <form onSubmit={handleSubmit} className="login-form">
              {state.isLoading && (
              <div className="overlay">
                <div className="spinner"></div>
                <p>Đang kết nối...</p>

              </div>
              )}
              {state.error && (
                <p className="changeInfo">
                  Sai username và password.
                </p>
              )}
              <div className="input-group">
                <input
                  type="text"
                  name="user"
                  placeholder="Username"
                  value={formData.user}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="pass"
                  placeholder="Password"
                  value={formData.pass}
                  onChange={handleChange}
                  required
                />
                <span className="eye-icon" onClick={togglePassword}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </span>
              </div>

              <button type="submit" className="signin-btn">
                SIGN IN
              </button>

              <div className="form-options">
                {/* <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me</span>
                </label> */}
                <Link to={"/register"} className="forgot-password">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>
      );
};

export default Login;
