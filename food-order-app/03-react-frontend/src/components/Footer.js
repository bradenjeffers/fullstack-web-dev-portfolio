import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => (
  <footer>
    <Container>
      <Row>
        <Col className="py-4 text-center">
          Copyright &copy; {new Date().getFullYear()} Food Order App (demo)
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
