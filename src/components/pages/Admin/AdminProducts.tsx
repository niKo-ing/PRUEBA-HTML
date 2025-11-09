// Página de administración de productos: edición inline, filtros y guardado en localStorage.
// No cambia la lógica: solo añade contexto para facilitar el mantenimiento.
// src/components/pages/Admin/AdminProducts.tsx
import { useMemo, useState, type ChangeEvent } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { productos } from "@domain/data";
import type { Product } from "@domain/types";

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
  // Fuente normalizada desde catálogo en memoria
  const initial = useMemo<Editable[]>(() => productos.map(toEditable), []);
  const [rows, setRows] = useState<Editable[]>(initial);

  // Filtros básicos en cabecera
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  // Lista de categorías únicas para el selector
  const cats = useMemo(() => {
    const acc = new Set<string>();
    initial.forEach((p) => acc.add(p.categoria));
    return Array.from(acc).sort();
  }, [initial]);

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

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;

          // Campos numéricos guardan número, pero mostramos string
          if (key === "precio" || key === "stock") {
            const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
            return { ...r, [key]: Number.isFinite(n) ? n : 0 } as Editable;
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

  // Persistencia mock: guarda cambios en localStorage
  const saveAll = () => {
    // Aquí podrías enviar a backend; por ahora, persistimos localStorage
    localStorage.setItem("admin_products", JSON.stringify(rows));
    alert("Cambios guardados (localStorage)");
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={6}>
          <h2 className="mb-0">Administrar productos</h2>
          <small className="text-body-secondary">
            {rows.length} ítems&nbsp;|&nbsp;
            <Badge bg="info">{filtered.length} visibles</Badge>
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
                      type="text"
                      inputMode="numeric"
                      value={String(sn(r.precio))}
                      onChange={onEdit(r.id, "precio")}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={String(sn(r.stock))}
                      onChange={onEdit(r.id, "stock")}
                    />
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
          <Button variant="outline-secondary" onClick={() => setRows(initial)}>
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
