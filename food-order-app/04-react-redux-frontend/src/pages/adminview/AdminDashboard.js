import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ENTITIES } from "./entities";

// Sections from the assessment brief whose screens were never built.
const PLANNED_SECTIONS = ["Food Items", "Orders", "Users", "Restaurant Menu"];

const AdminDashboard = () => (
  <Container>
    <h2 className="text-center p-4">Admin Dashboard</h2>
    <Row className="mb-3">
      {Object.values(ENTITIES).map((entity) => (
        <Col key={entity.key} md={4} className="mb-3">
          <Card border="secondary">
            <Card.Body>
              <Card.Title as="h4">{entity.plural}</Card.Title>
              <Link to={`/admin/${entity.key}`} className="btn btn-outline-info btn-sm me-3">
                View {entity.plural}
              </Link>
              <Link to={`/admin/${entity.key}/new`} className="btn btn-outline-info btn-sm">
                Add {entity.singular}
              </Link>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
    <Row className="mb-3">
      {PLANNED_SECTIONS.map((title) => (
        <Col key={title} md={4} className="mb-3">
          <Card border="light" className="text-muted">
            <Card.Body>
              <Card.Title as="h4">{title}</Card.Title>
              <Button variant="outline-secondary" size="sm" disabled>
                Not implemented yet
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export default AdminDashboard;
