import React,{useState,useEffect} from 'react'
import {Row, Col, Container, Form, Button, Image, Spinner} from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../../store/actions';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
// You can still use default image provided by the package
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';
import API from '../../../util/AxiosConfig';


const SignIn = () => {
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });

    
    const [submitted, setSubmitted] = useState(false);
    const { email, password } = inputs;
    const loggingIn = useSelector(state => state.authentication.loggingIn);
    const message = useSelector(state => state.alert.message);
    const loading = useSelector(state => state.authentication.loading);
    const dispatch = useDispatch();
    const location = useLocation();

    // reset login status
    useEffect(() => { 
        dispatch(userActions.logout()); 
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        setSubmitted(true);
        if (email && password) {
            // get return url from location state or default to home page
            const { from } = location.state || { from: { pathname: "/" } };
            dispatch(userActions.login(email, password, from));
        }
    }
    const { linkedInLogin } = useLinkedIn({
      clientId: '78cibhtx1urz7y',
      scope: 'r_liteprofile',
      redirectUri: `${window.location.origin}/linkedin`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
      onSuccess: (code) => {
      API
      .get(`/getUserCredentials/${code}`)
      .then(res => {
        const user = res.data;
       console.log(user);
        // Do something with user
      });
      },
      onError: (error) => {
        console.log(error);
      },
    });
    
  



   return (
      <>
         <section className="sign-in-page">
            <div id="container-inside">
               <div id="circle-small"></div>
               <div id="circle-medium"></div>
               <div id="circle-large"></div>
               <div id="circle-xlarge"></div>
               <div id="circle-xxlarge"></div>
            </div>
            <Container className="p-0">
               <Row className="no-gutters">
                  <Col md className="text-center pt-5">
                     <div className="sign-in-detail text-white">
                     
                     </div>
                  </Col>
                  <Col md="6" className="bg-white pt-5 pt-5 pb-lg-0 pb-5">
                     <div className="sign-in-from">
                     <Link to="#">
                          <span style={{fontSize:'4rem',fontWeight:'bold',color:'black'}}>pitchr</span>
                        </Link>
                        <h3 className="mb-0">Sign in</h3>
                        <p>Enter your email address and password to access admin panel.</p>
                        <Form className="mt-4">
                           <Form.Group className="form-group">
                              <Form.Label>Email address</Form.Label>
                              <Form.Control name="email" type="email" value={email} onChange={handleChange} className="mb-0" id="exampleInputEmail1" placeholder="Enter email"/>
          
                           </Form.Group>
                           <Form.Group className="form-group">
                              <Form.Label>Password</Form.Label>
                              <Link to="#" className="float-end">Forgot password?</Link>
                              <Form.Control name="password" type="password" onChange={handleChange} className="mb-0" id="exampleInputPassword1" placeholder="Password"/>
                        
                    {message?.length > 0 ? <div className="bad-feedback">{message}</div>: null}
                           </Form.Group>
                           <div className="d-inline-block w-100">

                              
                              {loading ?  <Button className="float-end" variant="flat" disabled>
    <Spinner
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
    />
    <span className="visually-hidden">Loading...</span>
  </Button>: <Button variant="flat" type="button"  className="float-end" onClick={handleSubmit}> <span>Sign in </span> </Button>}
                             
                           </div>
                        </Form>
                     </div>
                  </Col>
               </Row>
            </Container>
         </section>   
      </>
   )
}


export default SignIn;