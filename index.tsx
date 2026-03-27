import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import ChatRoom from "@/components/ChatRoom";

const Index = () => {
  const [nickname, setNickname] = useState<string | null>(
    () => sessionStorage.getItem("chat-nickname")
  );

  const handleLogin = (name: string) => {
    sessionStorage.setItem("chat-nickname", name);
    setNickname(name);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("chat-nickname");
    setNickname(null);
  };

  if (!nickname) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <ChatRoom nickname={nickname} onLogout={handleLogout} />;
};

export default Index;
