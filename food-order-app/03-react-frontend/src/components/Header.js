import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

// Cart, Orders and Profile are placeholders: those pages are not part of this
// assessment, so the links are shown disabled instead of doing nothing.
const Header = ({ user, onLogout }) => (
  <header>
    <Navbar bg="info" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand>Food Order App</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            {user && !user.isAdmin && (
              <>
                <Nav.Link disabled>
                  <i className="bi bi-cart" aria-hidden="true" /> Cart
                </Nav.Link>
                <Nav.Link disabled>
                  <i className="bi bi-receipt" aria-hidden="true" /> Orders
                </Nav.Link>
              </>
            )}
            {user && (
              <Nav.Link disabled>
                <i className="bi bi-person" aria-hidden="true" /> Profile
              </Nav.Link>
            )}
            {user && user.isAdmin && (
              <Nav.Link active href="#admin-dashboard">
                <i className="bi bi-gear" aria-hidden="true" /> Admin Dashboard
              </Nav.Link>
            )}
          </Nav>
          {user && (
            <Nav>
              <Nav.Link
                href="#sign-out"
                onClick={(event) => {
                  event.preventDefault();
                  onLogout();
                }}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" /> Sign
                Out
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  </header>
);

export default Header;
