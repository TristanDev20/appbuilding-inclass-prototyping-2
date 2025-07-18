import { Form, Button, Container } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';
import { useContext, useState, useEffect } from 'react';

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const authenticate = (e) => {
    e.preventDefault();

    fetch('https://appbuilding-inclass-prototyping-1.onrender.com/users/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.access) {
          localStorage.setItem('token', data.access);
          retrieveUserDetails(data.access);
          Swal.fire({
            title: "Login Successful",
            icon: "success",
            text: "Welcome to Blog App!"
          });
        } else {
          Swal.fire({
            title: "Login Failed",
            icon: "error",
            text: data.message || "Please check your credentials and try again."
          });
        }
      });

    setEmail('');
    setPassword('');
  };

  const retrieveUserDetails = (token) => {
    fetch('https://appbuilding-inclass-prototyping-1.onrender.com/users/details', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser({
          id: data.user._id,
          isAdmin: data.user.isAdmin
        });
       
      });
  };

  useEffect(() => {
    if (email !== '' && password !== '') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [email, password]);

  if (user && user.id) {
    return <Navigate to="/" />;
  }

  return (
    (user.id === null ) ?
    <>
    <Container className="mt-5 d-flex justify-content-center">
      <div className="border rounded mt-5 px-5 pt-4 pb-2 shadow-sm" style={{ maxWidth: "600px", width: "100%" }}>
        <h1 className="text-center mb-4">Log In</h1>
        <Form onSubmit={authenticate}>
          <Form.Group controlId="userEmail" className="mb-3">
            <Form.Label className='mb-0 mt-3'>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mb-4">
            <Form.Label className='mb-0 mt-3'>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            className="w-100 my-2 btn-submit"
            type="submit"
            variant="danger"
            disabled={!isActive}
          >
            Submit
          </Button>

          <div className="text-center mt-3">
            <p>Don’t have an account yet? <Link to="/register">Click here</Link> to register.</p>
          </div>
        </Form>
      </div>
    </Container>
    </>
    :
    <Navigate to='/' />
  );
}
