/**
 * Nombre del componente: AdminCategories
 * Propósito: Gestión de categorías con CRUD básico y persistencia local.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; deriva categorías desde el catálogo y localStorage.
 *
 * Métodos/funciones:
 * - addRow(): agrega una categoría nueva.
 * - onEdit(idx): edición inline de nombre.
 * - onDelete(idx): elimina categoría.
 * - saveAll(): guarda en localStorage.
 * - discard(): recupera último guardado o estado inicial.
 *
 * Hooks utilizados:
 * - useMemo: inicialización, filtro de búsqueda.
 * - useState: filas y consulta de búsqueda.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminCategories />
 * ```
 */
// Categorías: deriva categorías iniciales del catálogo, permite CRUD básico y guarda en localStorage.
import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { productos } from "@domain/data";

type Row = { nombre: string; parent?: string };

export default function AdminCategories() {
  const initial = useMemo(() => {
    const set = new Set<string>();
    productos.forEach(p => {
      const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
      cats.filter(Boolean).forEach(c => set.add(String(c)));
    });
    // Mezcla categorías existentes con las guardadas previamente
    const saved: Row[] = (() => {
      try { return JSON.parse(localStorage.getItem("admin_categories") || "null") || []; } catch { return []; }
    })();
    const merged = new Set([ ...Array.from(set), ...saved.map(r => r.nombre) ]);
    return Array.from(merged).sort().map(nombre => ({ nombre }));
  }, []);

  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");

  // Búsqueda simple por nombre
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter(r => !ql || r.nombre.toLowerCase().includes(ql));
  }, [rows, q]);

  // Operaciones CRUD básicas
  const addRow = () => setRows(prev => [{ nombre: "Nueva categoría", parent: "" }, ...prev]);
  const onEdit = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRows(prev => prev.map((r, i) => (i === idx ? { nombre: val } : r)));
  };
  const onDelete = (idx: number) => {
    const name = rows[idx]?.nombre || "(sin nombre)";
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    setRows(prev => prev.filter((_, i) => i !== idx));
  };
  const saveAll = () => { localStorage.setItem("admin_categories", JSON.stringify(rows)); alert("Categorías guardadas (localStorage)"); };
  const discard = () => {
    try { const saved: Row[] = JSON.parse(localStorage.getItem("admin_categories") || "null") || initial; setRows(saved); }
    catch { setRows(initial); }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={6}>
          <h2 className="mb-0">Categorías</h2>
          <small className="text-body-secondary">
            {rows.length} ítems&nbsp;|&nbsp;
            <Badge bg="info">{filtered.length} visibles</Badge>
          </small>
        </Col>
        <Col xs={12} md={4}>
          <Form.Label className="small mb-1">Buscar</Form.Label>
          <Form.Control type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre…" />
        </Col>
        <Col xs={12} md={2} className="d-grid">
          <Button variant="outline-secondary" onClick={addRow}>Nueva</Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {/* Tabla de categorías con edición inline y acciones */}
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Padre</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={idx}>
                  <td>
                    <Form.Control value={r.nombre} onChange={onEdit(idx)} />
                  </td>
                  <td>
                    <Form.Select
                      value={r.parent || ""}
                      onChange={(e) => setRows(prev => prev.map((row, i) => i === idx ? { ...row, parent: e.target.value } : row))}
                    >
                      <option value="">(sin padre)</option>
                      {rows.map((opt, i) => (
                        <option key={`${opt.nombre}-${i}`} value={opt.nombre}>{opt.nombre}</option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(idx)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-body-secondary py-4">Sin categorías.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={discard}>Descartar</Button>
          <Button variant="warning" onClick={saveAll}>Guardar</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
