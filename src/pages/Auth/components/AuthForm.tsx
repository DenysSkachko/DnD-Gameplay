import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@/context/AccountContext";
import { login, createAccount } from "../utils/authUtils";
import Input from "@/ui/Input";
import Button from "@/ui/Button";

type Props = {
  mode: "login" | "create";
};

const AuthForm = ({ mode }: Props) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setAccount } = useAccount();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      const { data, error } = await login(name, password);
      if (error || !data) setError("Неверное имя персонажа или пароль");
      else {
        setAccount({ id: data.id, character_name: data.character_name });
        navigate("/");
      }
    } else {
      if (!name || !password) {
        setError("Введите имя и пароль");
        return;
      }
      const { data, error } = await createAccount(name, password);
      if (error) setError(error.message);
      else {
        setAccount({ id: data.id, character_name: data.character_name });
        navigate("/");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
  <Input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Имя персонажа"
    required
    autoComplete="off"
  />
  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Пароль"
    required
    autoComplete="new-password"
  />
  {error && <p className="text-red-500 text-sm">{error}</p>}
  <Button type="submit">{mode === "login" ? "Log In" : "Create"}</Button>
</form>
  );
};

export default AuthForm;
