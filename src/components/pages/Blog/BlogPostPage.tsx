import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { blogPosts } from "./blogData";
import { useEffect } from "react";
import "@/styles/blog.css";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.slug === slug);
  
  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Todobarato Blog`;
      
      // Add meta tags for SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
      
      // Add Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', post.title);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', post.excerpt);
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && post.cover) {
        ogImage.setAttribute('content', window.location.origin + post.cover);
      }
    }
  }, [post]);
  
  if (!post) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <h1 className="display-4">Blog no encontrado</h1>
            <p className="lead">El artículo que buscas no existe o ha sido movido.</p>
            <Link to="/blogs" className="text-decoration-none">
              <Button variant="primary">
                Volver a todos los blogs
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }
  
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && (p.tag === post.tag || Math.random() > 0.5))
    .slice(0, 2);
  
  return (
    <div className="blog-post-page">
      {/* Hero Section */}
      <section className="blog-hero bg-light border-bottom">
        <Container>
          <Row className="align-items-center min-vh-25">
            <Col lg={8} className="mx-auto text-center">
              <div className="mb-3">
                <Badge bg="dark" className="me-2">{post.tag}</Badge>
                <small className="text-muted">
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </small>
              </div>
              <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
              <p className="lead text-muted mb-4">{post.excerpt}</p>
              <div className="d-flex justify-content-center align-items-center text-muted">
                <span className="me-3">
                  <i className="bi bi-person me-1"></i>
                  {post.author}
                </span>
                <span>
                  <i className="bi bi-clock me-1"></i>
                  {post.readTime} de lectura
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Cover Image */}
      {post.cover && (
        <section className="blog-cover">
          <Container fluid className="px-0">
            <div className="position-relative">
              <img
                src={post.cover}
                alt={post.title}
                className="img-fluid w-100"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/img/icono.png';
                }}
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
            </div>
          </Container>
        </section>
      )}

      {/* Article Content */}
      <section className="blog-content py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <article 
                className="blog-article"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* Keywords */}
              {post.keywords && post.keywords.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                  <h6 className="text-muted mb-3">Temas relacionados:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {post.keywords.map((keyword, index) => (
                      <Badge key={index} bg="secondary" className="px-3 py-2">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Share Section */}
              <div className="mt-5 pt-4 border-top">
                <h6 className="text-muted mb-3">Compartir artículo:</h6>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(post.title);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    }}
                  >
                    <i className="bi bi-facebook me-1"></i>
                    Facebook
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(post.title);
                      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                    }}
                  >
                    <i className="bi bi-twitter me-1"></i>
                    Twitter
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + url)}`, '_blank');
                    }}
                  >
                    <i className="bi bi-whatsapp me-1"></i>
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Enlace copiado al portapapeles');
                    }}
                  >
                    <i className="bi bi-link-45deg me-1"></i>
                    Copiar enlace
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts bg-light py-5">
          <Container>
            <Row>
              <Col lg={8} className="mx-auto">
                <h3 className="mb-4">Artículos relacionados</h3>
                <Row className="g-4">
                  {relatedPosts.map((relatedPost) => (
                    <Col md={6} key={relatedPost.id}>
                      <div className="card h-100 shadow-sm related-post-card">
                        {relatedPost.cover && (
                          <img
                            src={relatedPost.cover}
                            alt={relatedPost.title}
                            className="card-img-top"
                            style={{ height: '180px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/img/icono.png';
                            }}
                          />
                        )}
                        <div className="card-body">
                          <Badge bg="dark" className="mb-2">{relatedPost.tag}</Badge>
                          <h5 className="card-title">{relatedPost.title}</h5>
                          <p className="card-text text-muted">{relatedPost.excerpt}</p>
                          <Link 
                            to={`/blog/${relatedPost.slug}`}
                            className="text-decoration-none"
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                            >
                              Leer más
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* Navigation */}
      <section className="blog-navigation py-4">
        <Container>
          <Row>
            <Col className="text-center">
              <Button 
                variant="outline-secondary" 
                className="me-3"
                onClick={() => navigate('/blogs')}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Volver a todos los blogs
              </Button>
              <Button 
                variant="primary"
                onClick={() => navigate(-1)}
              >
                Volver atrás
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}