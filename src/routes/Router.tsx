import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Login from "../features/auth/login";
import Register from "../features/auth/Register";
import { MainApp } from "../features/MainApp/MainApp";
// import Test from "../module/Test.tsx";

const Router = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Test/>}/> */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login></Login>} />
      <Route path="/register" element={<Register></Register>} />
      <Route path="/home" element={<MainApp></MainApp>} />
    </Routes>
  );
};

export default Router;
