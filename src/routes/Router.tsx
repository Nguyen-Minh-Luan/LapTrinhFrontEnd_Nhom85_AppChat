
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import Login from "../features/auth/login";
import Register from "../features/auth/Register";
import { MainApp } from "../features/MainApp/MainApp";
import { useAppDispatch, useAppSelector } from "../hook/customHook";
import { reLogin } from "../redux/authSlice";
// import Test from "../module/Test.tsx";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLogin, token, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect( () => {
    // Nếu có token nhưng chưa login, thử relogin
    const tryRelogin = async () => { 
      if (token && !isLogin && !isLoading) {
         await dispatch(reLogin()); 
      } 
    };
    tryRelogin();
  }, [token, isLogin, isLoading, dispatch]);

  // Đang loading
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #5b54fa, #be4bdb)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>Đang kết nối...</p>
        </div>
      </div>
    );
  }

  // Không có token hoặc relogin thất bại -> redirect to login
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component để redirect nếu đã login
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLogin } = useAppSelector((state) => state.auth);
  
  if (isLogin) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};




const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />}/>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}/>
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>}/>
      <Route path="/home" element={<ProtectedRoute><MainApp /></ProtectedRoute>} /></Routes>
    );
};

export default Router;
