/**
 * Nombre del componente: RegisterPage
 * Propósito: Registro de usuarios con validaciones y autocompletado de dirección.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; persiste usuarios en localStorage.
 *
 * Métodos/funciones:
 * - handleInputChange(e): normaliza entrada (teléfono numérico, resto texto).
 * - handleSelectChange(e): actualiza `role`.
 * - handleSubmit(e): valida campos, persiste usuario y redirige a login.
 *
 * Hooks utilizados:
 * - useState: estado del formulario, dirección, validaciones y feedback.
 * - useNavigate: redirección tras registro.
 *
 * Ejemplo de uso:
 * ```tsx
 * <RegisterPage />
 * ```
 */
// src/components/pages/Auth/RegisterPage.tsx
import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import MapPreview from "@molecules/AddressAutocomplete/MapPreview";
import AddressAutocomplete from "@molecules/AddressAutocomplete/AddressAutocomplete";
import type { ParsedAddress } from "@molecules/AddressAutocomplete/AddressAutocomplete";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin";
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [direccionText, setDireccionText] = useState("");
  const [direccionParsed, setDireccionParsed] = useState<ParsedAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Validaciones dinámicas
  const passwordStrong = form.password.length >= 8;
  const passwordsFilled = form.password.length > 0 && form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  // Dirección válida si el usuario eligió una sugerencia (placeId y lat/lng)
  const addressSelected =
    !!direccionParsed?.placeId && typeof direccionParsed?.lat === "number" && typeof direccionParsed?.lng === "number";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const numeric = value.replace(/[^0-9+]/g, "");
      setForm({ ...form, [name]: numeric });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones principales
    const required = [
      form.nombre,
      form.apellido,
      form.email,
      form.telefono,
      form.password,
      form.confirmPassword,
    ];
    if (required.some((v) => v.trim() === "")) {
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

    if (!addressSelected) {
      setError("Selecciona una dirección desde las sugerencias de Google Maps");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    if (usuarios.some((u: any) => u.email === form.email)) {
      setError("Ya existe un usuario registrado con este correo");
      return;
    }

    // Guardado en localStorage (simulado)
    usuarios.push({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      telefono: form.telefono,
      role: form.role,
      direccion: {
        fullText: direccionParsed?.fullText,
        street: direccionParsed?.street,
        number: direccionParsed?.number,
        comuna: direccionParsed?.comuna,
        city: direccionParsed?.city,
        region: direccionParsed?.region,
        country: direccionParsed?.country,
        postalCode: direccionParsed?.postalCode,
        lat: direccionParsed?.lat,
        lng: direccionParsed?.lng,
        placeId: direccionParsed?.placeId,
      },
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

              <Form onSubmit={handleSubmit} noValidate>
                {/* === NOMBRE Y APELLIDO === */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="nombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        placeholder="Ej: Pérez"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* === CONTRASEÑAS === */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        required
                        isInvalid={form.password.length > 0 && !passwordStrong}
                        isValid={passwordStrong}
                      />
                      <Form.Control.Feedback type="invalid">
                        La contraseña debe tener al menos 8 caracteres.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirmar contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="********"
                        autoComplete="new-password"
                        required
                        isInvalid={passwordsFilled && !passwordsMatch}
                        isValid={passwordsFilled && passwordsMatch}
                      />
                      <Form.Control.Feedback type="invalid">
                        Las contraseñas no coinciden.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* === EMAIL === */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </Form.Group>

                {/* === TELÉFONO === */}
                <Form.Group className="mb-3" controlId="telefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleInputChange}
                    placeholder="+56912345678"
                    inputMode="tel"
                    pattern="^\\+?[0-9]{8,15}$"
                    required
                  />
                  <Form.Text className="text-muted">
                    Solo números (puede incluir + al inicio)
                  </Form.Text>
                </Form.Group>

                {/* === ROL === */}
                <Form.Group className="mb-3" controlId="role">
                  <Form.Label>Rol de usuario</Form.Label>
                  <Form.Select
                    name="role"
                    value={form.role}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    El rol "Administrador" tiene acceso al panel de administración.
                  </Form.Text>
                </Form.Group>
                
                {/* === DIRECCIÓN CON GOOGLE MAPS === */}
                <AddressAutocomplete
                  label="Dirección"
                  value={direccionText}
                  onTextChange={(v) => {
                    setDireccionText(v);
                    setDireccionParsed(null); // si escribe a mano, invalida selección
                  }}
                  onAddressSelected={(addr) => setDireccionParsed(addr)}
                  required
                  error={!addressSelected ? "Selecciona una sugerencia para validar la dirección." : null}
                  isInvalid={direccionText.length > 0 && !addressSelected}
                  isValid={addressSelected}
                />

                {/* === MAPA: solo mostrar si hay lat/lng válidos === */}
                <div className="mb-3">
                  {typeof direccionParsed?.lat === "number" && typeof direccionParsed?.lng === "number" ? (
                    <MapPreview lat={direccionParsed.lat} lng={direccionParsed.lng} />
                  ) : (
                    <div
                      className="bg-light rounded-4 d-flex align-items-center justify-content-center"
                      style={{ height: 240 }}
                    >
                      <small className="text-body-secondary">
                        Escribe y selecciona una dirección para ver el mapa…
                      </small>
                    </div>
                  )}
                </div>

                {/* === BOTÓN SUBMIT === */}
                <div className="d-grid mt-4">
                  <Button
                    variant="warning"
                    size="lg"
                    type="submit"
                    disabled={!passwordStrong || !passwordsMatch || !addressSelected}
                  >
                    Registrarme
                  </Button>
                </div>

                {/* === LINK A LOGIN === */}
                <p className="mt-4 text-center mb-0">
                  ¿Ya tienes cuenta?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => navigate("/login")}
                  >
                    Inicia sesión
                  </Button>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
