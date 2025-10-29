export function hidePreloader() {
    const el = document.getElementById("preloader");
    if (!el)
        return;
    el.classList.add("hidden");
    setTimeout(() => el.remove(), 500);
}
