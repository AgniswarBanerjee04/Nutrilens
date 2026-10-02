import React from "react";
import { AuthPage } from "./AuthPage";

interface SignupProps {
  onSwitchToLogin?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  return (
    <AuthPage
      initialTab="signup"
      onTabChange={(tab) => {
        if (tab === "login" && onSwitchToLogin) {
          onSwitchToLogin();
        }
      }}
    />
  );
};
