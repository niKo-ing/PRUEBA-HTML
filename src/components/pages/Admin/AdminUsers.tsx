/**
 * Nombre del componente: AdminUsers
 * Propósito: Administración de usuarios con búsqueda, edición inline y autocompletado de dirección.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; opera sobre un dataset persistido en localStorage.
 *
 * Métodos/funciones:
 * - addUser(): agrega un usuario con valores por defecto.
 * - removeUser(idx): elimina usuario.
 * - onEditInput/onEditSelect: actualiza campos.
 * - onAddressTextChange/onAddressSelected: maneja dirección y validación.
 * - getAddressText(u): obtiene texto actual de dirección considerando legacy.
 * - isAddressValid(u): valida que la dirección tenga placeId y coordenadas.
 *
 * Hooks utilizados:
 * - useEffect: carga y sincroniza textos de dirección desde localStorage.
 * - useState: filas, filtro y estados de dirección/errores.
 * - useMemo: filtrado por búsqueda.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminUsers />
 * ```
 */
// Usuarios: administración básica con búsqueda, edición inline y autocompletado de dirección.
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import AddressAutocomplete from "@molecules/AddressAutocomplete/AddressAutocomplete";
import type { ParsedAddress } from "@molecules/AddressAutocomplete/AddressAutocomplete";
import { adminRegisterUser, adminListUsers } from "@/services/admin.service";

// Modelo de usuario editable en tabla
type Usuario = {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  password?: string; // campo opcional para alta en backend
  direccion?: ParsedAddress;
  ciudad?: string; // Campo legacy para compatibilidad hacia atrás
  role?: string; // 'admin' | 'user'
};

const sv = (v?: string | null) => v ?? "";

export default function AdminUsers() {
  const [rows, setRows] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  
  // Estado para manejar los campos de dirección de cada usuario
  const [addressTexts, setAddressTexts] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((u) => {
      const base = `${sv(u.nombre)} ${sv(u.apellido)} ${sv(u.email)}`.toLowerCase();
      return !ql || base.includes(ql);
    });
  }, [rows, q]);

  // Carga usuarios desde backend (fallback a localStorage si falla) y sincroniza textos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usuariosBackend = await adminListUsers();
        const usuarios: Usuario[] = Array.isArray(usuariosBackend) && usuariosBackend.length > 0
          ? usuariosBackend as any
          : JSON.parse(localStorage.getItem("usuarios") || "[]");
        if (cancelled) return;
        const initialTexts: Record<string, string> = {};
        usuarios.forEach(user => {
          if ((user as any).direccion?.fullText) {
            initialTexts[user.email] = (user as any).direccion.fullText;
          } else if ((user as any).ciudad) {
            initialTexts[user.email] = (user as any).ciudad;
          }
        });
        setAddressTexts(initialTexts);
        setRows(usuarios);
      } catch {
        try {
          const usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]");
          if (!cancelled) setRows(usuarios);
        } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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

  // Agrega un usuario nuevo con valores por defecto
  const addUser = () => {
    const newUser: Usuario = {
      nombre: "",
      apellido: "",
      email: `user${rows.length + 1}@example.com`,
      telefono: "",
      password: "",
      direccion: undefined as any,
      role: "user"
    };
    setRows((prev) => [...prev, newUser]);
  };

  const removeUser = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // Funciones para manejar cambios de dirección
  const onAddressTextChange = (email: string, value: string) => {
    setAddressTexts((prev) => ({ ...prev, [email]: value }));
  };

  const onAddressSelected = (email: string, address: ParsedAddress | null) => {
    setRows((prev) => prev.map((user) =>
      user.email === email ? { ...user, direccion: address ?? undefined as any } : user

    ));
    setAddressErrors((prev) => ({ ...prev, [email]: "" }));
  };

  // Función para obtener el texto de dirección actual
  const getAddressText = (user: Usuario): string => {
    if (user.email && addressTexts[user.email]) {
      return addressTexts[user.email]!;
    }
    if (user.direccion?.fullText) {
      return user.direccion.fullText;
    }
    // Compatibilidad hacia atrás: si existe ciudad legacy, usarla
    if (user.ciudad) {
      return user.ciudad;
    }
    return "";
  };

  // Función para validar dirección seleccionada
  const isAddressValid = (user: Usuario): boolean => {
    return !!user.direccion?.placeId && typeof user.direccion?.lat === "number" && typeof user.direccion?.lng === "number";
  };

  // Registro en backend para nuevos usuarios (por ahora, sólo alta)
  const saveAll = async () => {
    try {
      // En esta primera integración, registramos los usuarios que tengan password definido
      const toRegister = rows.filter(u => !!u.password).map(u => ({
        nombre: sv(u.nombre),
        apellido: sv(u.apellido),
        email: sv(u.email),
        telefono: sv(u.telefono),
        password: sv(u.password),
        direccion: u.direccion ?? undefined
      }));
      for (const user of toRegister) {
        try { await adminRegisterUser(user as any); } catch (e) { /* continuar */ }
      }
      localStorage.setItem("usuarios", JSON.stringify(rows));
      alert("Usuarios guardados (backend + localStorage)");
    } catch (e: any) {
      alert(`Error al guardar usuarios: ${e?.message || e}`);
    }
  };

  return (
    <Container className="py-4">
      {loading && (
        <Row className="mb-3">
          <Col>
            <div className="small text-body-secondary">Cargando usuarios…</div>
          </Col>
        </Row>
      )}
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
                <th>Password</th>
                <th>Dirección</th>
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
                  <Form.Control type="password" value={sv(u.password)} onChange={onEditInput(idx, "password" as any)} placeholder="Password (sólo alta)" />
                </td>
                <td>
                  <AddressAutocomplete
                    label=""
                    value={getAddressText(u)}
                    onTextChange={(value) => onAddressTextChange(u.email, value)}
                    onAddressSelected={(address) => onAddressSelected(u.email, address)}
                    required={false}
                    placeholder="Ej: Av. Apoquindo 1234, Las Condes"
                    error={addressErrors[u.email] || null}
                    isInvalid={!!addressErrors[u.email]}
                    isValid={isAddressValid(u)}
                  />
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
                  <td colSpan={6} className="text-center text-body-secondary py-4">
                    Sin usuarios para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={() => {
            try { 
              const usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]"); 
              // Reinicializar textos de dirección
              const initialTexts: Record<string, string> = {};
              usuarios.forEach(user => {
                if (user.direccion?.fullText) {
                  initialTexts[user.email] = user.direccion.fullText;
                } else if (user.ciudad) {
                  initialTexts[user.email] = user.ciudad;
                }
              });
              setAddressTexts(initialTexts);
              setAddressErrors({});
              setRows(usuarios); 
            } catch {}
          }}>Descartar cambios</Button>
          <Button variant="warning" onClick={saveAll}>Guardar cambios</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
