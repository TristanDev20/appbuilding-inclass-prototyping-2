import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { useContext } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import UserContext from '../context/UserContext';

export default function AppNavbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();


  return (
    <Navbar expand="lg" className="bg-light">
      <Container>
        <Navbar.Brand as={Link} to="/">Blog Application</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && user.id ? (
              <>
                {user.isAdmin ? (
                  <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
                ) : (
                  <Nav.Link as={Link} to="/blogpost">Blog Posts</Nav.Link>
                )}
                <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
