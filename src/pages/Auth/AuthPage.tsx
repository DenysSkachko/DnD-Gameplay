import { useState } from "react";
import AuthForm from "./components/AuthForm";
import TabButton from "@/ui/TabButton";

const AuthPage = () => {
  const [tab, setTab] = useState<"login" | "create">("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-dark bg-accent px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <div className="flex mb-4">
          <TabButton active={tab === "login"} onClick={() => setTab("login")}>
            Login
          </TabButton>
          <TabButton active={tab === "create"} onClick={() => setTab("create")}>
            New
          </TabButton>
        </div>

        <AuthForm mode={tab} />
      </div>
    </div>
  );
};

export default AuthPage;
