/**
 * Nombre del componente: AdminProducts
 * Propósito: Administración y edición inline de catálogo con filtros y persistencia local.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; carga catálogo y permite edición en tabla.
 *
 * Métodos/funciones:
 * - sv(v?): string — Normaliza strings a valor seguro.
 * - sn(v?): number — Asegura números válidos en formularios.
 * - slugify(s: string): string — Genera slugs web.
 * - toEditable(p: Product): Editable — Convierte Product a tipo editable.
 *
 * Hooks utilizados:
 * - useMemo: inicialización y filtros; categorías únicas.
 * - useState: estado de filas y filtros.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminProducts />
 * ```
 */
// Página de administración de productos: edición inline, filtros y guardado en localStorage.
// No cambia la lógica: solo añade contexto para facilitar el mantenimiento.
// src/components/pages/Admin/AdminProducts.tsx
import { useMemo, useState, type ChangeEvent } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { adminListProducts, adminBulkUpsertProducts, type AdminProduct } from "@/services/admin.service";
import type { Product } from "@domain/types";
import { useEffect } from "react";

/* ----------------------- Helpers ----------------------- */
// sv/sn: aseguran valores string/number válidos en formularios
const sv = (v?: string | null) => v ?? "";                  // string value (nunca undefined)
const sn = (v?: number | null) => (Number.isFinite(v as number) ? (v as number) : 0); // number seguro

// slugify: normaliza nombres a slugs web
const slugify = (s: string) =>
  sv(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* Editable sin opcionales: nunca undefined */
// Tipo normalizado para edición en tabla; evita undefined en los inputs
type Editable = {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  categoria: string;
  stock: number;
  img: string;
  images: string[];      // al menos 1 (se llena con img si no hay)
  descripcion: string;
};

// Convierte Product del dominio a Editable para formularios
function toEditable(p: Product): Editable {
  const nombre       = sv(p.nombre);
  const imagenBase   = sv(p.img) || "/assets/img/placeholder.png";
  const images       = Array.isArray(p.images) && p.images.length > 0 ? p.images : [imagenBase];
  const categoria    = Array.isArray(p.categoria) ? sv(p.categoria[0]) : sv(p.categoria);
  const slug         = sv(p.slug) || slugify(nombre || `prod-${p.id}`);

  return {
    id: p.id,
    nombre,
    slug,
    precio: sn(p.precio),
    categoria,
    stock: sn(p.stock),
    img: imagenBase,
    images,
    descripcion: sv(p.descripcion),
  };
}

/* ----------------------- Componente ----------------------- */
export default function AdminProducts() {
  const [rows, setRows] = useState<Editable[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialRows, setInitialRows] = useState<Editable[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newProd, setNewProd] = useState<Editable>({
    id: 0,
    nombre: "",
    slug: "",
    precio: 0,
    categoria: "",
    stock: 0,
    img: "/assets/img/placeholder.png",
    images: ["/assets/img/placeholder.png"],
    descripcion: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carga inicial desde backend
  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminListProducts()
      .then((items) => {
        if (!alive) return;
        const editable = (items as AdminProduct[]).map((p) => toEditable(p as unknown as Product));
        setRows(editable);
        setInitialRows(editable);
      })
      .catch(() => void 0)
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // Filtros básicos en cabecera
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  // Lista de categorías únicas para el selector
  const cats = useMemo(() => {
    const acc = new Set<string>();
    rows.forEach((p) => acc.add(p.categoria));
    return Array.from(acc).sort();
  }, [rows]);

  // Aplica búsqueda por nombre/slug y filtro por categoría
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ = !ql || r.nombre.toLowerCase().includes(ql) || r.slug.toLowerCase().includes(ql);
      const okC = !cat || r.categoria === cat;
      return okQ && okC;
    });
  }, [rows, q, cat]);

  // Handler genérico de edición por campo; mantiene tipos correctos
  const onEdit =
    <K extends keyof Editable>(id: number, key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const raw = e.target.value;

      // Validación visual para campos numéricos
      if (key === "precio" || key === "stock") {
        const hasLetters = /[a-zA-Z]/.test(raw);
        const hasMinus = raw.includes("-");
        const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
        const invalid = hasLetters || Number.isNaN(n) || hasMinus;
        const k = `${id}:${String(key)}`;
        setFieldErrors((prev) => {
          const next = { ...prev };
          if (invalid) next[k] = hasMinus ? "Debe ser ≥ 0" : "Número inválido";
          else delete next[k];
          return next;
        });
      }

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;

          // Campos numéricos guardan número, pero mostramos string
          if (key === "precio" || key === "stock") {
            const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
            const safe = Number.isFinite(n) ? n : 0;
            const clamped = Math.max(0, safe);
            return { ...r, [key]: clamped } as Editable;
          }

          // slug: autogenerable si queda vacío
          if (key === "slug") {
            const val = sv(raw);
            return { ...r, slug: val || slugify(r.nombre || `prod-${r.id}`) };
          }

          // resto string
          return { ...r, [key]: sv(raw) } as Editable;
        })
      );
    };

  // Guarda cambios en backend (bulk upsert)
  const saveAll = async () => {
    try {
      const payload: AdminProduct[] = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        nombre: r.nombre,
        precio: r.precio,
        stock: r.stock,
        categoria: r.categoria,
        img: r.img,
        images: r.images,
        descripcion: r.descripcion,
      }));
      const res = await adminBulkUpsertProducts(payload);
      alert(`Guardado: upserted=${res.upserted}, modified=${res.modified}`);
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message || e}`);
    }
  };

  // Validación rápida del nuevo producto
  const validateNew = (p: Editable) => {
    const errs: Record<string, string> = {};
    if (!sv(p.nombre)) errs.nombre = "Nombre requerido";
    if (!sn(p.precio)) errs.precio = "Precio debe ser mayor a 0";
    if (!sv(p.categoria)) errs.categoria = "Categoría requerida";
    if (!sn(p.stock) && sn(p.stock) < 0) errs.stock = "Stock no puede ser negativo";
    return errs;
  };

  const addProduct = () => {
    const baseId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const prepared: Editable = {
      ...newProd,
      id: baseId,
      nombre: sv(newProd.nombre),
      slug: sv(newProd.slug) || slugify(newProd.nombre || `prod-${baseId}`),
      precio: Math.max(0, sn(newProd.precio)),
      stock: Math.max(0, sn(newProd.stock)),
      categoria: sv(newProd.categoria),
      img: sv(newProd.img) || "/assets/img/placeholder.png",
      images: (newProd.images?.length ? newProd.images : [sv(newProd.img) || "/assets/img/placeholder.png"]).map(sv),
      descripcion: sv(newProd.descripcion),
    };
    const errs = validateNew(prepared);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setRows(prev => [prepared, ...prev]);
    setInitialRows(prev => [prepared, ...prev]);
    setNewProd({
      id: 0,
      nombre: "",
      slug: "",
      precio: 0,
      categoria: "",
      stock: 0,
      img: "/assets/img/placeholder.png",
      images: ["/assets/img/placeholder.png"],
      descripcion: "",
    });
    setErrors({});
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={6}>
          <h2 className="mb-0">Administrar productos</h2>
          <small className="text-body-secondary">
            {rows.length} ítems&nbsp;|&nbsp;
            <Badge bg="info">{filtered.length} visibles</Badge>
            {loading && <span className="ms-2">Cargando…</span>}
          </small>
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small mb-1">Buscar</Form.Label>
          <Form.Control
            type="search"
            value={sv(q)}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre o slug…"
          />
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small mb-1">Categoría</Form.Label>
          <Form.Select value={sv(cat)} onChange={(e) => setCat(e.target.value)}>
            <option value="">Todas</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <div className="d-flex align-items-end gap-3">
            <div className="flex-grow-1">
              <Form.Label className="small mb-1">Nombre</Form.Label>
              <Form.Control value={newProd.nombre} onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })} placeholder="Nombre del producto" />
              {errors.nombre && <div className="text-danger small mt-1">{errors.nombre}</div>}
            </div>
            <div style={{ width: 140 }}>
              <Form.Label className="small mb-1">Precio</Form.Label>
              <Form.Control type="number" value={String(newProd.precio)} onChange={(e) => setNewProd({ ...newProd, precio: Number(e.target.value) })} />
              {errors.precio && <div className="text-danger small mt-1">{errors.precio}</div>}
            </div>
            <div style={{ width: 140 }}>
              <Form.Label className="small mb-1">Stock</Form.Label>
              <Form.Control type="number" value={String(newProd.stock)} onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })} />
            </div>
            <div style={{ width: 200 }}>
              <Form.Label className="small mb-1">Categoría</Form.Label>
              <Form.Control value={newProd.categoria} onChange={(e) => setNewProd({ ...newProd, categoria: e.target.value })} placeholder="Ej: Teclado" />
              {errors.categoria && <div className="text-danger small mt-1">{errors.categoria}</div>}
            </div>
            <div className="d-grid" style={{ width: 160 }}>
              <Form.Label className="small mb-1">&nbsp;</Form.Label>
              <Button variant="primary" onClick={addProduct}>Crear producto</Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {/* Tabla editable: cada celda actualiza el estado local */}
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 90 }}>Imagen</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th style={{ width: 130 }}>Precio</th>
                <th style={{ width: 120 }}>Stock</th>
                <th style={{ width: 180 }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <img
                      src={sv(r.img)}
                      alt={r.nombre}
                      width={64}
                      height={48}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={sv(r.nombre)}
                      onChange={onEdit(r.id, "nombre")}
                      placeholder="Nombre…"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={sv(r.slug)}
                      onChange={onEdit(r.id, "slug")}
                      placeholder="slug-producto"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min={0}
                      value={String(sn(r.precio))}
                      onChange={onEdit(r.id, "precio")}
                      isInvalid={Boolean(fieldErrors[`${r.id}:precio`])}
                    />
                    {fieldErrors[`${r.id}:precio`] && (
                      <div className="text-danger small mt-1">{fieldErrors[`${r.id}:precio`]}</div>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min={0}
                      value={String(sn(r.stock))}
                      onChange={onEdit(r.id, "stock")}
                      isInvalid={Boolean(fieldErrors[`${r.id}:stock`])}
                    />
                    {fieldErrors[`${r.id}:stock`] && (
                      <div className="text-danger small mt-1">{fieldErrors[`${r.id}:stock`]}</div>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={sv(r.categoria)}
                      onChange={onEdit(r.id, "categoria")}
                      placeholder="Categoría…"
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">
                    Sin resultados para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={() => setRows(initialRows)}>
            Descartar cambios
          </Button>
          <Button variant="warning" onClick={saveAll}>
            Guardar cambios
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
