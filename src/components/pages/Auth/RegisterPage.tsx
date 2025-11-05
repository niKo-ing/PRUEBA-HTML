import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ Validaciones dinámicas
  const passwordStrong = form.password.length >= 8;
  const passwordsFilled = form.password.length > 0 && form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // ✅ Restringe el teléfono a números y "+"
    if (name === "telefono") {
      const numeric = value.replace(/[^0-9+]/g, "");
      setForm({ ...form, [name]: numeric });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Object.values(form).some((v) => v.trim() === "")) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!passwordStrong) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    if (usuarios.some((u: any) => u.email === form.email)) {
      setError("Ya existe un usuario registrado con este correo");
      return;
    }

    usuarios.push({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      telefono: form.telefono,
      direccion: form.direccion,
      ciudad: form.ciudad,
      password: form.password,
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-4 text-center">Crear una cuenta</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Registro exitoso, redirigiendo...</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="nombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Juanito"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="apellido">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        placeholder="Ej: Pérez"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* === Contraseña === */}
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        required
                        isInvalid={form.password.length > 0 && !passwordStrong}
                        isValid={passwordStrong}
                      />
                      <Form.Control.Feedback type="invalid">
                        La contraseña debe tener al menos 8 caracteres.
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="valid">
                        Contraseña segura ✔️
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* === Confirmar Contraseña === */}
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirmar contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="********"
                        required
                        isInvalid={passwordsFilled && !passwordsMatch}
                        isValid={passwordsFilled && passwordsMatch}
                      />
                      <Form.Control.Feedback type="invalid">
                        Las contraseñas no coinciden.
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="valid">
                        Contraseñas coinciden ✔️
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* === Email === */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </Form.Group>

                {/* === Teléfono === */}
                <Form.Group className="mb-3" controlId="telefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+56912345678"
                    pattern="^\+?[0-9]{8,15}$"
                    required
                  />
                  <Form.Text className="text-muted">
                    Solo números (puede incluir + al inicio)
                  </Form.Text>
                </Form.Group>

                {/* === Ciudad === */}
                <Form.Group className="mb-3" controlId="ciudad">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ej: Santiago"
                    required
                  />
                </Form.Group>

                {/* === Dirección === */}
                <Form.Group className="mb-3" controlId="direccion">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, depto..."
                    required
                  />
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button
                    variant="warning"
                    size="lg"
                    type="submit"
                    disabled={!passwordStrong || !passwordsMatch}
                  >
                    Registrarme
                  </Button>
                </div>
              </Form>

              <p className="mt-4 text-center mb-0">
                ¿Ya tienes cuenta?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
                  Inicia sesión
                </Button>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
