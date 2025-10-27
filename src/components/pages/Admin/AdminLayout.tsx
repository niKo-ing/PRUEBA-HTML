import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/src/styles/admin.css"; // ajusta la ruta si la moviste
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return <div className="sb-wrapper">{children}</div>;
}