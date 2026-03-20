import React from "react";
import { Outlet } from "react-router-dom";
import NavBarClient from "../components/NavBarClient";
import Footer from "../components/Footer";

export default function LayoutClient() {
  return (
    <div className="w-full min-h-screen">
      <NavBarClient />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
