import { z } from "zod";
const dominios = /(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
export const emailSchema = z.string().email().refine((e) => dominios.test(e), {
    message: "Solo @duoc.cl, @profesor.duoc.cl o @gmail.com"
});
function validaRUN(run) {
    // run viene limpio y en MAYÚSCULAS (ver transform abajo)
    if (!/^[0-9]{7,8}[0-9K]$/.test(run))
        return false;
    const body = run.slice(0, -1);
    const dv = run.slice(-1); // ya es "0-9" o "K"
    let sum = 0;
    let m = 2;
    // Usamos charAt para evitar string | undefined (a diferencia de .at())
    for (let i = body.length - 1; i >= 0; i--) {
        const digit = Number(body.charAt(i)); // siempre string → number
        sum += digit * m;
        m = m === 7 ? 2 : m + 1;
    }
    const r = 11 - (sum % 11);
    const dvCalc = r === 11 ? "0" : r === 10 ? "K" : String(r);
    return dvCalc === dv;
}
export const runSchema = z
    // Si a veces te llega número, usa z.coerce.string() en vez de z.string()
    .string()
    .trim()
    // Limpia puntos y guiones y pone en mayúsculas para comparar con "K"
    .transform((s) => s.replace(/[.\-]/g, "").toUpperCase())
    .refine(validaRUN, "RUN inválido");
export const registroSchema = z.object({
    run: runSchema,
    nombre: z.string().min(1).max(100),
    email: emailSchema,
    password: z.string().min(6).max(50),
    confirm: z.string().min(6).max(50),
    region: z.string().min(1),
    comuna: z.string().min(1),
    direccion: z.string().min(5).max(200)
}).refine(d => d.password === d.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" });
