import { Card, Row, Col } from "react-bootstrap";

export default function AdminDashboard() {
  return (
    <>
      <h2 className="mb-3">Dashboard</h2>
      <Row className="g-3">
        <Col md={4}><Card body>Ventas (hoy): $0</Card></Col>
        <Col md={4}><Card body>Pedidos pendientes: 0</Card></Col>
        <Col md={4}><Card body>Productos publicados: 0</Card></Col>
      </Row>
    </>
  );
}
