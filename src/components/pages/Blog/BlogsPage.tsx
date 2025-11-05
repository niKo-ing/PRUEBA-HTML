import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "@/styles/blog.css";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag?: string;
  cover?: string;
};

const posts: Post[] = [
  {
    id: "blog-1",
    title: "Guía para elegir tu mouse gamer",
    excerpt: "Sensores, DPI, switches y agarres: lo clave para decidir.",
    date: new Date().toISOString(),
    tag: "Guías",
    cover: "/assets/img/blog1.jpg",
  },
  {
    id: "blog-2",
    title: "Teclados mecánicos: ¿switches rojos, azules o marrones?",
    excerpt: "Compara tipos de switch según uso y preferencias.",
    date: new Date(Date.now() - 86400000).toISOString(),
    tag: "Comparativas",
    cover: "/assets/img/blog2.jpg",
  },
  {
    id: "blog-3",
    title: "Setup eficiente para teletrabajo",
    excerpt: "Ergonomía, iluminación y accesorios que realmente aportan.",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    tag: "Tips",
    cover: "/assets/img/blog3.jpg",
  },
];

export default function BlogsPage() {
  return (
    <div className="blog-page">
      <section className="bg-light border-bottom py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-2">Blogs</h1>
              <p className="text-body-secondary mb-0">
                Novedades, guías y comparativas para ayudarte a elegir.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="container-xxl py-4">
        <Row className="g-4">
          {posts.map((p) => (
            <Col key={p.id} md={4}>
              <Card className="h-100 shadow-sm">
                {p.cover && (
                  <Card.Img
                    variant="top"
                    src={p.cover}
                    alt={p.title}
                    className="object-cover"
                    style={{ height: 180 }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/img/icono.png";
                    }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="dark">{p.tag || "Blog"}</Badge>
                    <span className="small text-body-secondary">
                      {new Date(p.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Card.Title className="h5">{p.title}</Card.Title>
                  <Card.Text className="text-body-secondary">{p.excerpt}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}