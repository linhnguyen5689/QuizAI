import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="flex items-center justify-between p-4 mx-auto max-w-7xl lg:px-8">
      {children}
    </div>
  );
};

export default Layout;
