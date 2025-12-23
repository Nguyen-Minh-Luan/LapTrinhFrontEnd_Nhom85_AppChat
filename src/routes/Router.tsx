import React from "react";
import { BrowserRouter,Routes,Route, Navigate} from "react-router-dom";
import Login from "../features/auth/Login.tsx"
import Register from "../features/auth/Register.tsx"

const Router = () =>{
    return(
            <Routes>
                <Route path="/" element={<Navigate to ="/login"/>}/>
                <Route path="/login" element={<Login></Login>}/>
                <Route path="/register" element={<Register></Register>}/>
            </Routes>
    );
};

export default Router