/**
 * Nombre del componente: ProductsPage
 * Propósito: Listado de productos con búsqueda, filtros, orden y paginación.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; usa query params para estado (q, cat, min, max, sort, page, size).
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea moneda CLP.
 * - toArr(c: string|string[]): string[] — Normaliza categorías a arreglo.
 * - matchCategoria(pCat, target): boolean — Verifica coincidencia de categoría.
 * - sorters: Record<SortKey, (a,b)=>number> — Map de comparadores.
 *
 * Hooks utilizados:
 * - useSearchParams: lee/actualiza query params.
 * - useMemo: calcula filtrado, orden y paginación.
 * - useCallback: actualiza parámetros preservando estado.
 * - useCart: añade productos al carrito.
 *
 * Ejemplo de uso:
 * ```tsx
 * <ProductsPage />
 * ```
 */
/**
 * Página ProductsPage - Listado con búsqueda/filtros/orden/paginación
 * Props: no recibe; Estado: derivado de query params; Dependencias: react-bootstrap, react-router-dom, useCart
 */
import { useMemo, useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Container, Row, Col, Form, InputGroup, Button, Card, Badge, Pagination
} from "react-bootstrap";
import { fetchProducts } from "../../../services/products.service";
import type { Product } from "@domain/types";
import { useCart } from "@domain/cart/cart.context";

// ————————————————————————————————————————
// Utils
// ————————————————————————————————————————
/**
 * Formatea número a CLP sin decimales
 * @param {number} v - Valor numérico
 * @returns {string} Moneda CLP
 */
function formatCLP(v: number) {
  return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

// categoria puede ser string o string[]
type Categoria = string | string[];
/**
 * Helpers de categorías: normaliza y compara
 * @returns {boolean} True si pCat incluye target
 */
const toArr = (c: Categoria) => (Array.isArray(c) ? c : [c]);
const matchCategoria = (pCat: Categoria, target: string) => !target || toArr(pCat).some((x) => x === target);

// categorías únicas: derivadas desde la data cargada
function computeCategories(items: Product[]): string[] {
  const acc = new Set<string>();
  for (const p of items) {
    const cats = toArr(p.categoria as Categoria);
    for (const c of cats) acc.add(String(c));
  }
  return Array.from(acc).sort();
}

// ordenadores
type SortKey = "relevancia" | "precio_asc" | "precio_desc" | "nombre_asc" | "nombre_desc";
/**
 * Map de ordenadores por clave
 * @returns {number} Comparador de sort
 */
const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  relevancia: () => 0,
  precio_asc: (a, b) => a.precio - b.precio,
  precio_desc: (a, b) => b.precio - a.precio,
  nombre_asc: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  nombre_desc: (a, b) => b.nombre.localeCompare(a.nombre, "es"),
};

// ————————————————————————————————————————
// Página
// ————————————————————————————————————————
/**
 * Renderiza listado con filtros, tarjetas y paginación
 * @returns {JSX.Element} Contenido de la página de productos
 */
export default function ProductsPage() {
  const { add } = useCart();
  const [params, setParams] = useSearchParams();

  // lee query params
  const q        = params.get("q") ?? "";
  const cat      = params.get("cat") ?? "";         // categoría
  const min      = params.get("min") ?? "";         // precio mínimo
  const max      = params.get("max") ?? "";         // precio máximo
  const sort     = (params.get("sort") as SortKey) ?? "relevancia";
  const page     = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const pageSize = Math.min(48, Math.max(4, parseInt(params.get("size") ?? "12", 10))); // 12 por defecto

  // setters de params (mantienen el resto)
  /**
   * Actualiza query param manteniendo el resto
   * Resetea page al cambiar filtros (salvo page/size)
   */
  const setParam = useCallback((k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
    // al cambiar filtros, resetear a página 1 salvo que sea size
    if (k !== "page" && k !== "size") next.set("page", "1");
    setParams(next, { replace: true });
  }, [params, setParams]);

  /**
   * Limpia filtros; conserva el tamaño de página si está definido
   */
  const resetFilters = () => {
    const keep = new URLSearchParams();
    // conserva page size si quieres
    if (params.get("size")) keep.set("size", params.get("size")!);
    setParams(keep, { replace: true });
  };

  // datos: intenta cargar desde API, fallback al estático
  const [itemsApi, setItemsApi] = useState<Product[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetchProducts(true)
      .then((data) => {
        if (!alive) return;
        setItemsApi(Array.isArray(data) ? data : []);
      })
      .catch(() => void 0);
    return () => {
      alive = false;
    };
  }, []);

  const fuente = (itemsApi ?? []).map((p) => ({
    // normaliza campos por si vienen del backend con nombres consistentes
    ...p,
    categoria: p.categoria,
  }));

  const ALL_CATEGORIES = useMemo(() => computeCategories(fuente), [fuente]);

  // filtrar + ordenar
  /**
   * Aplica búsqueda, filtros y orden a la lista de productos
   */
  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    const minV = min ? Number(min) : null;
    const maxV = max ? Number(max) : null;

    const items = fuente.filter((p) => {
      if (qNorm) {
        const hayCoincidencia =
          p.nombre.toLowerCase().includes(qNorm) ||
          (p.descripcion ?? "").toLowerCase().includes(qNorm);
        if (!hayCoincidencia) return false;
      }
      if (cat && !matchCategoria(p.categoria as Categoria, cat)) return false;
      if (minV !== null && p.precio < minV) return false;
      if (maxV !== null && p.precio > maxV) return false;
      return true;
    });

    const sorter = sorters[sort] ?? sorters.relevancia;
    return [...items].sort(sorter);
  }, [q, cat, min, max, sort, fuente]);

  // paginación
  // Paginación segura
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  // render
  return (
    <Container className="py-4">
      <Row className="align-items-end g-3 mb-3">
        {/* Búsqueda: sincronizada con query param "q" para compartir estado */}
        <Col md={4}>
          <Form.Label className="fw-semibold">Buscar</Form.Label>
          <InputGroup>
            <Form.Control
              placeholder="Nombre, descripción…"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setParam("q", "")}>
              Limpiar
            </Button>
          </InputGroup>
        </Col>

        {/* Categoría: filtra por categoría única del producto (query "cat") */}
        <Col md={3}>
          <Form.Label className="fw-semibold">Categoría</Form.Label>
          <Form.Select
            value={cat}
            onChange={(e) => setParam("cat", e.target.value || null)}
          >
            <option value="">Todas</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>

        {/* Precio: rango mínimo/máximo (queries "min"/"max") */}
        <Col md={3}>
          <Form.Label className="fw-semibold">Precio</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              min={0}
              placeholder="Mín"
              value={min}
              onChange={(e) => setParam("min", e.target.value)}
            />
            <Form.Control
              type="number"
              min={0}
              placeholder="Máx"
              value={max}
              onChange={(e) => setParam("max", e.target.value)}
            />
          </InputGroup>
        </Col>

        {/* Orden: selector de criterio (query "sort") */}
        <Col md={2}>
          <Form.Label className="fw-semibold">Ordenar por</Form.Label>
          <Form.Select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre_asc">Nombre A → Z</option>
            <option value="nombre_desc">Nombre Z → A</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="g-2 mb-3">
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={resetFilters}>
            Reiniciar filtros
          </Button>
        </Col>
        <Col xs="auto" className="ms-auto">
          <Form.Select
            value={String(pageSize)}
            onChange={(e) => setParam("size", e.target.value)}
          >
            {[8, 12, 16, 24, 32].map(s => (
              <option key={s} value={s}>{s} por página</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Resumen de filtros aplicados y contador de resultados */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-body-secondary">
          {total} resultado{total !== 1 ? "s" : ""}
          {cat ? <> · categoría: <Badge bg="secondary">{cat}</Badge></> : null}
          {q ? <> · búsqueda: “{q}”</> : null}
        </div>
      </div>

      {/* Grid de tarjetas de producto */}
      <Row className="g-3">
        {pageItems.map((p) => (
          <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100">
              <Link to={`/producto/${p.slug}`} className="text-decoration-none">
                <Card.Img
                  variant="top"
                  src={(p.images?.[0] ?? p.img)!}
                  alt={p.nombre}
                  className="card-img-fit"  // asegura no recortar (tienes esta clase en app.css)
                />
              </Link>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h6 mb-1">{p.nombre}</Card.Title>
                <div className="mb-2 text-muted small">
                  {Array.isArray(p.categoria) ? p.categoria.join(", ") : p.categoria}
                </div>
                <div className="fw-bold mb-3">{formatCLP(p.precio)}</div>

                <div className="mt-auto d-flex gap-2">
                  <Link to={`/producto/${p.slug}`} className="btn btn-outline-secondary btn-sm">
                    Ver
                  </Link>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => add(p.id, 1)}
                  >
                    Añadir
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Paginación: controla page actual y total con query param "page" */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => setParam("page", "1")} disabled={pageSafe === 1} />
            <Pagination.Prev  onClick={() => setParam("page", String(Math.max(1, pageSafe - 1)))} disabled={pageSafe === 1} />
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <Pagination.Item
                  key={n}
                  active={n === pageSafe}
                  onClick={() => setParam("page", String(n))}
                >
                  {n}
                </Pagination.Item>
              );
            })}
            <Pagination.Next onClick={() => setParam("page", String(Math.min(totalPages, pageSafe + 1)))} disabled={pageSafe === totalPages} />
            <Pagination.Last onClick={() => setParam("page", String(totalPages))} disabled={pageSafe === totalPages} />
          </Pagination>
        </div>
      )}
    </Container>
  );
}
