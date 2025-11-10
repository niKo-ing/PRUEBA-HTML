/**
 * Nombre del componente: LoginPage
 * Propósito: Formulario de inicio de sesión con validación básica y redirección.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - onSubmit(e): maneja envío, llama `useAuth.login`, redirige a admin/home.
 *
 * Hooks utilizados:
 * - useState: gestiona email, password, error y loading.
 * - useNavigate: navegación tras login.
 * - useAuth: acceso a `login`.
 *
 * Ejemplo de uso:
 * ```tsx
 * <LoginPage />
 * ```
 */
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      const goAdmin = (() => { try { return localStorage.getItem("isAdmin") === "1"; } catch { return false; } })();
      navigate(goAdmin ? "/admin" : "/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-4 text-center">Iniciar sesión</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPass(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="warning" size="lg" type="submit" disabled={loading}>
                    {loading ? "Ingresando..." : "Ingresar"}
                  </Button>
                </div>
              </Form>

              <p className="mt-3 text-center mb-0">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="link-primary">Regístrate</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
