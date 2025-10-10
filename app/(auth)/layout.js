import React from "react";

const AuthLayout = ({ children }) => {
  // Use the theme tokens and let each page control its own centering
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default AuthLayout;
