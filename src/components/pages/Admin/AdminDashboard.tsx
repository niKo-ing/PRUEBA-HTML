/**
 * Nombre del componente: AdminDashboard
 * Propósito: Panel con KPIs del día y últimos pedidos (mock/localStorage).
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; obtiene datos locales.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea números como CLP sin decimales.
 *
 * Hooks utilizados:
 * - useState: estado de pedidos cargados.
 * - useEffect: lectura inicial desde localStorage.
 * - useMemo: derivación de KPIs (pendientes, ventas hoy, recientes).
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminDashboard />
 * ```
 */
// Dashboard: muestra KPIs del día y últimos pedidos desde localStorage.
import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Badge, ProgressBar, Table, Button, Form } from "react-bootstrap";
import { adminListProducts, adminDeleteProduct, adminBulkUpsertProducts } from "@/services/admin.service";
import { adminListUsers, adminDeleteUser } from "@/services/admin.service";

type Estado = "pendiente" | "procesando" | "enviado" | "completado" | "cancelado";
type Order = { id: string; cliente: string; email: string; total: number; fecha: string; estado: Estado; items: number };

// Formatea valores en CLP sin decimales
function formatCLP(v: number) {
  try { return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }); }
  catch { return `$${Math.round(v)}`; }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingView, setLoadingView] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [qProd, setQProd] = useState("");
  const [qUser, setQUser] = useState("");

  // Carga pedidos para estadísticas (mock) desde localStorage
  useEffect(() => {
    try {
      const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
      setOrders(saved);
    } catch {}
  }, []);

  const pending = useMemo(() => orders.filter(o => o.estado === "pendiente").length, [orders]);
  // Suma ventas de hoy usando rango horario
  const today = useMemo(() => {
    const t0 = new Date(); t0.setHours(0,0,0,0);
    const t1 = new Date(); t1.setHours(23,59,59,999);
    return orders.reduce((acc, o) => {
      const d = new Date(o.fecha).getTime();
      return d >= t0.getTime() && d <= t1.getTime() ? acc + (Number.isFinite(o.total) ? o.total : 0) : acc;
    }, 0);
  }, [orders]);

  const totalProducts =  productosPublicados();

  // Obtiene número de productos publicados (mock o desde localStorage)
  function productosPublicados() {
    try {
      // Si en el futuro guardamos productos en localStorage, tomarlos; por ahora estimado
      const raw = localStorage.getItem("admin_products");
      if (raw) {
        const arr = JSON.parse(raw) as Array<{ id: number }>; return Array.isArray(arr) ? arr.length : 0;
      }
    } catch {}
    return 24; // placeholder visual
  }

  const progressDay = Math.min(100, Math.round((today / 200000) * 100)); // meta visual

  // Tabla de los 5 últimos pedidos
  const recent = useMemo(() => orders.slice(0, 5), [orders]);

  // Carga de datos para vista
  useEffect(() => {
    let alive = true;
    setLoadingView(true);
    Promise.all([adminListProducts(), adminListUsers()])
      .then(([prods, us]) => {
        if (!alive) return;
        setProducts(Array.isArray(prods) ? prods : []);
        setUsers(Array.isArray(us) ? us : []);
      })
      .finally(() => alive && setLoadingView(false));
    return () => { alive = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    const ql = qProd.trim().toLowerCase();
    return products.filter((p) => !ql || String(p.nombre).toLowerCase().includes(ql));
  }, [products, qProd]);

  const filteredUsers = useMemo(() => {
    const ql = qUser.trim().toLowerCase();
    return users.filter((u) => !ql || String(u.email).toLowerCase().includes(ql) || String(u.nombre).toLowerCase().includes(ql));
  }, [users, qUser]);

  const deleteProduct = async (id: number) => {
    if (!confirm(`¿Eliminar producto ${id}?`)) return;
    setLoadingAdmin(true);
    try { await adminDeleteProduct(id); setProducts((prev) => prev.filter(p => p.id !== id)); }
    finally { setLoadingAdmin(false); }
  };

  const deleteUser = async (email: string) => {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;
    setLoadingAdmin(true);
    try { await adminDeleteUser(email); setUsers((prev) => prev.filter(u => u.email !== email)); }
    finally { setLoadingAdmin(false); }
  };

  // Reportes simples: métricas derivadas
  const totalUsers = users.length;
  const totalProds = products.length;
  const avgPrice = useMemo(() => {
    const nums = products.map((p) => Number(p.precio) || 0);
    const sum = nums.reduce((a, b) => a + b, 0);
    return nums.length ? Math.round(sum / nums.length) : 0;
  }, [products]);

  // Categorías: agrupadas desde productos
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const cat = Array.isArray(p.categoria) ? (p.categoria[0] ?? "") : (p.categoria ?? "");
      const k = String(cat || "(sin categoría)");
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  // Crear producto: formulario simple con validación
  const [newProd, setNewProd] = useState({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" });
  const [newProdErrors, setNewProdErrors] = useState<Record<string, string>>({});

  const slugify = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

  const validateNewProd = () => {
    const errs: Record<string, string> = {};
    if (!newProd.nombre.trim()) errs.nombre = "Requerido";
    const precio = Number(newProd.precio);
    if (!Number.isFinite(precio) || precio <= 0) errs.precio = "Debe ser número > 0";
    const stock = Number(newProd.stock);
    if (!Number.isFinite(stock) || stock < 0) errs.stock = "Debe ser número ≥ 0";
    if (!newProd.categoria.trim()) errs.categoria = "Requerido";
    setNewProdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onCreateProduct = async () => {
    if (!validateNewProd()) return;
    setLoadingAdmin(true);
    try {
      const nextId = products.length ? Math.max(...products.map((p: any) => Number(p.id) || 0)) + 1 : Date.now();
      const payload = [{
        id: nextId,
        nombre: newProd.nombre.trim(),
        slug: slugify(newProd.nombre.trim()) || String(nextId),
        precio: Number(newProd.precio),
        stock: Number(newProd.stock),
        categoria: newProd.categoria.trim(),
        img: newProd.img.trim(),
        images: newProd.img.trim() ? [newProd.img.trim()] : [],
        descripcion: newProd.descripcion.trim(),
      }];
      await adminBulkUpsertProducts(payload as any);
      setProducts((prev) => [...prev, payload[0]]);
      setNewProd({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" });
      setNewProdErrors({});
      alert("Producto creado");
    } catch (e) {
      alert("Error al crear producto");
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Dashboard</h2>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-baseline">
                <div>
                  <div className="text-body-secondary small">Ventas (hoy)</div>
                  <div className="h4 mb-1">{formatCLP(today)}</div>
                </div>
                <Badge bg="success">Meta</Badge>
              </div>
              <ProgressBar now={progressDay} variant="success" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-body-secondary small">Pedidos pendientes</div>
              <div className="h4 mb-1">{pending}</div>
              <div className="small text-body-secondary">En proceso y por atender</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-body-secondary small">Productos publicados</div>
              <div className="h4 mb-1">{totalProducts}</div>
              <div className="small text-body-secondary">Incluye variaciones</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección 1: Visualización */}
      <div className="mt-4 p-3 border rounded" style={{ background: "var(--bs-light)" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Visualización</h5>
          {loadingView && <span className="small text-body-secondary">Cargando…</span>}
        </div>
        <Row className="g-3">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="fw-semibold">Productos</div>
                <Form.Control size="sm" placeholder="Filtrar…" value={qProd} onChange={(e) => setQProd(e.target.value)} style={{ maxWidth: 180 }} />
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td>{formatCLP(Number(p.precio) || 0)}</td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-danger" onClick={() => deleteProduct(p.id)}>Eliminar</Button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-body-secondary py-3">Sin productos.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="fw-semibold">Usuarios</div>
                <Form.Control size="sm" placeholder="Filtrar…" value={qUser} onChange={(e) => setQUser(e.target.value)} style={{ maxWidth: 180 }} />
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.email}>
                        <td>{u.nombre}</td>
                        <td className="text-body-secondary">{u.email}</td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-danger" onClick={() => deleteUser(u.email)}>Eliminar</Button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-body-secondary py-3">Sin usuarios.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="g-3 mt-1">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold">Categorías</Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Categoría</th>
                      <th className="text-end">Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(([name, count]) => (
                      <tr key={name as string}>
                        <td>{name as string}</td>
                        <td className="text-end">{count as number}</td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center text-body-secondary py-3">Sin categorías.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold">Reportes</Card.Header>
              <Card.Body>
                <div className="small text-body-secondary mb-2">Métricas clave (placeholder visual)</div>
                <div className="mb-2">Usuarios: <span className="fw-semibold">{totalUsers}</span></div>
                <div className="mb-2">Productos: <span className="fw-semibold">{totalProds}</span></div>
                <div className="mb-2">Precio promedio: <span className="fw-semibold">{formatCLP(avgPrice)}</span></div>
                <div className="mb-2">Progreso ventas (día):</div>
                <ProgressBar now={progressDay} variant="info" />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Sección 2: Administración (estilo distinto) */}
      <div className="mt-4 p-3 border rounded" style={{ background: "#fffdf5" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Administración</h5>
          {loadingAdmin && <span className="small text-body-secondary">Procesando…</span>}
        </div>
        <Row className="g-3">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold">Crear producto</Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Label className="small mb-1">Nombre</Form.Label>
                    <Form.Control value={newProd.nombre} onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })} isInvalid={!!newProdErrors.nombre} />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small mb-1">Precio</Form.Label>
                    <Form.Control value={newProd.precio} onChange={(e) => setNewProd({ ...newProd, precio: e.target.value })} isInvalid={!!newProdErrors.precio} />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small mb-1">Stock</Form.Label>
                    <Form.Control value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} isInvalid={!!newProdErrors.stock} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small mb-1">Categoría</Form.Label>
                    <Form.Control value={newProd.categoria} onChange={(e) => setNewProd({ ...newProd, categoria: e.target.value })} isInvalid={!!newProdErrors.categoria} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small mb-1">Imagen</Form.Label>
                    <Form.Control value={newProd.img} onChange={(e) => setNewProd({ ...newProd, img: e.target.value })} />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small mb-1">Descripción</Form.Label>
                    <Form.Control as="textarea" rows={2} value={newProd.descripcion} onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })} />
                  </Col>
                </Row>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outline-secondary" onClick={() => { setNewProd({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" }); setNewProdErrors({}); }}>Limpiar</Button>
                  <Button variant="warning" onClick={onCreateProduct} disabled={loadingAdmin}>Crear</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold">Crear categoría</Card.Header>
              <Card.Body>
                <div className="text-body-secondary small">Usa el módulo “Categorías” para alta y jerarquía.</div>
                <Button href="/admin/categories" variant="warning">Ir a Categorías</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
