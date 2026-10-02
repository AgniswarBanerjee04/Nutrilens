import React from "react";
import { AuthPage } from "./AuthPage";

interface LoginProps {
  onSwitchToSignup?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  return (
    <AuthPage
      initialTab="login"
      onTabChange={(tab) => {
        if (tab === "signup" && onSwitchToSignup) {
          onSwitchToSignup();
        }
      }}
    />
  );
};
