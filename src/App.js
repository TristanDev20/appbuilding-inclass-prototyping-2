import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import AppNavbar from './components/AppNavbar';
import { UserProvider } from './context/UserContext';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BlogPost from './pages/BlogPosts';
import Logout from './pages/Logout';
import Admin from './pages/Admin';


function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null

  });

  const unsetUser = () => {

      localStorage.clear();

    };
  useEffect(() => {
    const token = localStorage.getItem('token');
      if (!token) return; 

      fetch(`http://localhost:4000/users/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        // console.log(data)

        if (typeof data.user !== "undefined") {
  
          setUser({
            id: data.user._id,
          });
  
        } else {
  
          setUser({
            id: null,
            isAdmin: null
          });
  
        }
  
      })
  
      }, []);


  return (
    <>
    <UserProvider value={{ user, setUser, unsetUser }}>
    <BrowserRouter>
      <AppNavbar />
        <Container>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/blogpost" element={<BlogPost />}/>
            <Route path="/logout" element={<Logout />}/>
            <Route path="/admin" element={<Admin />}/>
          </Routes>
        </Container>
    </BrowserRouter>
    </UserProvider> 
    </>
  );
}

export default App;
