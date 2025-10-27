import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <Header />
      <main className="overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}