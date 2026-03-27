import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleHeart } from "lucide-react";

interface LoginScreenProps {
  onLogin: (nickname: string) => void;
}

const SECRET_CODE = "ourspace";

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() !== SECRET_CODE) {
      setError("Wrong secret code 🔒");
      return;
    }
    if (!nickname.trim()) {
      setError("Pick a nickname!");
      return;
    }
    onLogin(nickname.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageCircleHeart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Our Space ☕
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the secret code to join the chat
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Secret code..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Your nickname..."
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                maxLength={20}
                className="bg-secondary/50"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Enter Chat 💬
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
