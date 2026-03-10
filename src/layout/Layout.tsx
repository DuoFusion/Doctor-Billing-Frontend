import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const preventNumberInputScroll = (event: WheelEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;

      const isNativeNumberInput =
        active.tagName === "INPUT" && (active as HTMLInputElement).type === "number";

      const isAntInputNumber =
        active.closest?.(".ant-input-number") != null ||
        active.classList.contains?.("ant-input-number");

      if (isNativeNumberInput || isAntInputNumber) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventNumberInputScroll, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", preventNumberInputScroll, { capture: true });
  }, []);

  return (
    <div className="app-light-theme relative flex min-h-screen overflow-x-hidden overflow-y-hidden bg-[#fefffc] text-[#29483c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_2%_-20%,rgba(254,255,252,0.96),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(235,255,216,0.52),transparent_34%)]" />

      <SideBar
        open={open}
        setOpen={setOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`relative z-10 ml-0 flex min-h-screen flex-1 flex-col overflow-hidden transition-[margin-left] duration-500 ease-in-out md:ml-64 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Navbar setOpen={setOpen} collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-[72px]">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
