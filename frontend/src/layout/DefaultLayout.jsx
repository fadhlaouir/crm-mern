import React from "react";
import SideBar from "./SideBar";

export const DefaultLayout = ({ children }) => {
  return (
    <div className="default-layout">
      <header className="header ">
        <SideBar />
      </header>

      <main className="main">{children}</main>
    </div>
  );
};
