import React from "react";

const AuthLayout = ({ children }) => {
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default AuthLayout;
