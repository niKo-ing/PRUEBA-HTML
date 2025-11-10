/**
 * Nombre del componente: BlogsPage
 * Propósito: Mostrar listado de artículos del blog con tarjetas enlazadas a detalle.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - posts: arreglo estático de post con `id`, `title`, `excerpt`, `date`, `tag`, `cover`, `slug`.
 *
 * Hooks utilizados:
 * - No utiliza hooks.
 *
 * Ejemplo de uso:
 * ```tsx
 * <BlogsPage />
 * ```
 */
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { blogPosts } from "./blogData";
import "@/styles/blog.css";
import "@/styles/blog-post.css";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag?: string;
  cover?: string;
  slug: string;
};

const posts: Post[] = [
  {
    id: "blog-1",
    title: "Guía para elegir tu mouse gamer",
    excerpt: "Sensores, DPI, switches y agarres: lo clave para decidir.",
    date: new Date().toISOString(),
    tag: "Guías",
    cover: "/assets/img/blog1.jpg",
    slug: "guia-para-elegir-tu-mouse-gamer",
  },
  {
    id: "blog-2",
    title: "Teclados mecánicos: ¿switches rojos, azules o marrones?",
    excerpt: "Compara tipos de switch según uso y preferencias.",
    date: new Date(Date.now() - 86400000).toISOString(),
    tag: "Comparativas",
    cover: "/assets/img/blog2.jpg",
    slug: "teclados-mecanicos-switches-comparativa",
  },
  {
    id: "blog-3",
    title: "Setup eficiente para teletrabajo",
    excerpt: "Ergonomía, iluminación y accesorios que realmente aportan.",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    tag: "Tips",
    cover: "/assets/img/blog3.jpg",
    slug: "setup-eficiente-teletrabajo",
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
              <Card className="h-100 shadow-sm blog-card-hover">
                <Link 
                  to={`/blog/${p.slug}`}
                  className="text-decoration-none text-dark"
                >
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
                </Link>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="dark">{p.tag || "Blog"}</Badge>
                    <span className="small text-body-secondary">
                      {new Date(p.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Link 
                    to={`/blog/${p.slug}`}
                    className="text-decoration-none text-dark"
                  >
                    <Card.Title className="h5 mb-3">{p.title}</Card.Title>
                  </Link>
                  <Card.Text className="text-body-secondary flex-grow-1">
                    {p.excerpt}
                  </Card.Text>
                  <div className="mt-auto">
                    <Link to={`/blog/${p.slug}`} className="text-decoration-none">
                      <Button variant="outline-primary" size="sm">
                        Leer más
                        <i className="bi bi-arrow-right ms-1"></i>
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
