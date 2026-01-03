import React, { useEffect, useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { CURRENT_SOCKET } from '../../module/appsocket.ts';

    const Login = () => {
      const [showPassword, setShowPassword] = useState(false);
      const navigate = useNavigate();
      const [isConnecting, setIsConnecting] = useState(false);
      const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
      });
      const togglePassword = () => {
        setShowPassword(!showPassword);
      };
      const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      };

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsConnecting(true)
        const login = ()=>{
        console.log('Form submitted:', formData);
        const {username,password,rememberMe} = formData;
        CURRENT_SOCKET.login(username,password)
        }
        if(!CURRENT_SOCKET.isConnect()){
          await CURRENT_SOCKET.connect(); 
        }
        login()
        setIsConnecting(false)
      };
      
      useEffect(()=>{
         CURRENT_SOCKET.onConnected = () => {
          console.log("Socket connected");
        };

        CURRENT_SOCKET.onMessageReceived = (data) => {
          console.log("Server trả về:", data);

          if (data.event === "LOGIN") {
            if (data.status === "success") {
              console.log("Login thành công");
              navigate("/register")
            } else {
              console.log("Login thất bại:", data.message);
            }
          }
        };
        CURRENT_SOCKET.onError = (e) => {
          console.error("Socket error", e);
        };

        CURRENT_SOCKET.onClosed = () => {
          console.log("Socket closed");
        };
        return () => {
          CURRENT_SOCKET.onConnected = null;
          CURRENT_SOCKET.onMessageReceived = null;
          CURRENT_SOCKET.onError = null;
          CURRENT_SOCKET.onClosed = null;
        };
      },[]);

      return (
        
        <div className="login-wrapper">
          <div className="login-container">
            <h1 className="main-title">Login to App Chat</h1>

            <form onSubmit={handleSubmit} className="login-form">
              {isConnecting && (
              <div className="overlay">
                <div className="spinner"></div>
                <p>Đang kết nối...</p>
              </div>
              )}
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
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
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me</span>
                </label>
                <Link to={"/register"} className="forgot-password">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>
      );
    };

    export default Login;