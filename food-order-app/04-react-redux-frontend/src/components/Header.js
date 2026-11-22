import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../actions/userActions";
import { isAdmin } from "../utils/apiHelpers";

const Header = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);

  return (
    <header>
      <Navbar bg="info" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Food Order App</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {userInfo && (
                <LinkContainer to="/profile">
                  <Nav.Link>
                    <i className="bi bi-person-fill me-1" aria-hidden="true" />
                    Profile
                  </Nav.Link>
                </LinkContainer>
              )}
              {isAdmin(userInfo) && (
                <LinkContainer to="/admin">
                  <Nav.Link>
                    <i className="bi bi-gear me-1" aria-hidden="true" />
                    Admin Dashboard
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
            <Nav>
              {userInfo ? (
                <Nav.Link as="button" onClick={() => dispatch(logout())}>
                  <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                  Sign Out
                </Nav.Link>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                    Log In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
