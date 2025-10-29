export function formatCLP(v?: number | null) {
  return ((v ?? 0) as number).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}