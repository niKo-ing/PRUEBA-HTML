import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";

type Usuario = {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  role?: string; // 'admin' | 'user'
};

const sv = (v?: string | null) => v ?? "";

export default function AdminUsers() {
  const [rows, setRows] = useState<Usuario[]>([]);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((u) => {
      const base = `${sv(u.nombre)} ${sv(u.apellido)} ${sv(u.email)}`.toLowerCase();
      return !ql || base.includes(ql);
    });
  }, [rows, q]);

  useEffect(() => {
    try {
      const usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]");
      setRows(usuarios);
    } catch {}
  }, []);

  type InputEl = HTMLInputElement | HTMLTextAreaElement;
  const onEditInput = <K extends keyof Usuario>(idx: number, key: K) =>
    (e: ChangeEvent<InputEl>) => {
      const val = e.target.value;
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: sv(val) } : r)));
    };

  const onEditSelect = <K extends keyof Usuario>(idx: number, key: K) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: sv(val) } : r)));
    };

  const addUser = () => {
    setRows((prev) => [
      ...prev,
      { nombre: "", apellido: "", email: `user${prev.length + 1}@example.com`, telefono: "", ciudad: "", role: "user" }
    ]);
  };

  const removeUser = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveAll = () => {
    localStorage.setItem("usuarios", JSON.stringify(rows));
    alert("Usuarios guardados (localStorage)");
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={6}>
          <h2 className="mb-0">Administrar usuarios</h2>
          <small className="text-body-secondary">
            {rows.length} ítems&nbsp;|&nbsp;
            <Badge bg="info">{filtered.length} visibles</Badge>
          </small>
        </Col>
        <Col xs={12} md={4}>
          <Form.Label className="small mb-1">Buscar</Form.Label>
          <Form.Control
            type="search"
            value={sv(q)}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre o email…"
          />
        </Col>
        <Col xs={12} md={2} className="d-grid">
          <Button variant="outline-secondary" onClick={addUser}>Nuevo</Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Rol</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={`${u.email}-${idx}`}>
                  <td>
                    <Form.Control type="text" value={sv(u.nombre)} onChange={onEditInput(idx, "nombre")} />
                  </td>
                  <td>
                    <Form.Control type="text" value={sv(u.apellido)} onChange={onEditInput(idx, "apellido")} />
                  </td>
                  <td>
                    <Form.Control type="email" value={sv(u.email)} onChange={onEditInput(idx, "email")} />
                  </td>
                  <td>
                    <Form.Control type="text" value={sv(u.telefono)} onChange={onEditInput(idx, "telefono")} />
                  </td>
                  <td>
                    <Form.Control type="text" value={sv(u.ciudad)} onChange={onEditInput(idx, "ciudad")} />
                  </td>
                  <td>
                    <Form.Select value={sv(u.role)} onChange={onEditSelect(idx, "role")}>
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </Form.Select>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-danger" size="sm" onClick={() => removeUser(idx)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">
                    Sin usuarios para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={() => {
            try { const usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]"); setRows(usuarios); } catch {}
          }}>Descartar cambios</Button>
          <Button variant="warning" onClick={saveAll}>Guardar cambios</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}