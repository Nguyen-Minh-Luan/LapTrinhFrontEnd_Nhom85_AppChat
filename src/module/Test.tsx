import React, { useEffect } from "react";
import { CURRENT_SOCKET } from "./appsocket.ts";

const Test = ()=>{
    useEffect(()=>{
        CURRENT_SOCKET.onConnected = () =>{
            console.log("kết nối đến server thành công")
        }
    }, []);
    return (
        <div>mở F12 check log</div>
    );
}
export default Test