import React from "react";
import { Outlet } from "react-router-dom";
import ClientShell from "../components/saas/ClientShell";

export default function LayoutClient() {
  return (
    <ClientShell>
      <Outlet />
    </ClientShell>
  );
}
