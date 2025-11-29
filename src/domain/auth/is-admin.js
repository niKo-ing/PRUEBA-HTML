export function isAdminUser(user) {
    if (!user)
        return false;
    // Política actual: emails que empiezan por admin/root
    return /^(admin|root)@/i.test(user.email);
}
export function isAdminByStorage() {
    try {
        return localStorage.getItem("isAdmin") === "1";
    }
    catch {
        return false;
    }
}
