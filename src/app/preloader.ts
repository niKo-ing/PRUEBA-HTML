export function hidePreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  el.style.opacity = "0";
  el.style.visibility = "hidden";
  el.style.pointerEvents = "none";

  setTimeout(() => el.remove(), 250);
}