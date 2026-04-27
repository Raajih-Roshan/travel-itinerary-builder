import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { token }           = useAuth();

  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"]
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);