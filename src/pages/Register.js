import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate, Link} from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
	
	const {user} = useContext(UserContext);
	const navigate = useNavigate();
	const [email,setEmail] = useState("");
	const [username,setUsername] = useState("");
	const [password,setPassword] = useState("");
	const [verifyPassword, setVerifyPassword] = useState("");
	
	const [isActive, setIsActive] = useState(false);
	
	function registerUser(e) {
		
		e.preventDefault();
		
		fetch('https://appbuilding-inclass-prototyping-1.onrender.com/users/register',{
			method: 'POST',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				

				email: email,
				username: username,
				password: password
				
			})
		})

		.then(res => res.json())
		.then(data => {
			
			
			console.log(data);
			
			
			if(data.message === "Registered Successfully"){
				
				setEmail('');
				setUsername('');
				setPassword('');
				setVerifyPassword('');
				
				Swal.fire({
					title: "Registration Successful",
					icon: "success",
					text: "Thank you for registering!",
					confirmButtonText: "OK"
				}).then(() => {
					navigate('/login');
				});


				
			} 
			
		})
	}
	
	useEffect(()=>{
		
		if(( email !== "" && username !== "" && password !=="" && verifyPassword !=="") && (password === verifyPassword)){
			
			setIsActive(true)
			
		} else {
			
			setIsActive(false)
			
		}
		
	},[email, username, password, verifyPassword])
	
	return (
		
		<>
			<Container className="mt-4 d-flex justify-content-center">
			<div className="border rounded my-5 px-5 pt-4 pb-2 shadow-sm" style={{ maxWidth: "600px", width: "100%" }}>
				<Form onSubmit={(e) => registerUser(e)}>
				<h1 className="my-2 text-center">Register</h1>
					<Form.Group>
					<Form.Label className='mb-0 mt-3'>Email:</Form.Label>
						<Form.Control 
							type="email"
							placeholder="Enter Email" 
							required 
							value={email} 
							onChange={e => {setEmail(e.target.value)}}/>
					</Form.Group>
					<Form.Group>
					<Form.Label className='mb-0 mt-3'>Username:</Form.Label>
						<Form.Control 
							type="text"
							placeholder="Enter Username" 
							required 
							value={username} 
							onChange={e => {setUsername(e.target.value)}}/>
					</Form.Group>
					<Form.Group>
					<Form.Label className='mb-0 mt-3'>Password:</Form.Label>
						<Form.Control 
							type="password" 
							placeholder="Enter Password" 
							required 
							value={password} 
							onChange={e => {setPassword(e.target.value)}}/>
					</Form.Group>
					<Form.Group>
					<Form.Label className='mb-0 mt-3'>Verify Password:</Form.Label>
						<Form.Control 
							type="password" 
							placeholder="Verify your password" 
							required 
							value={verifyPassword} 
							onChange={e => {setVerifyPassword(e.target.value)}}/>
					</Form.Group>
					{
						isActive ?
						<Button className='mt-3' variant="success" type="submit">Register</Button>		
						: 
						<Button className='mt-3' variant="danger" disabled>Please enter you registration details</Button>
					}
					</Form>
					<div className='text-center mt-3'>
						<p className='pb-0'>
						Already have an account? <Link to="/login">Click here</Link> to log in.
						</p>
					</div>
			</div>
			
			</Container>
		
		</>
		
	)
}