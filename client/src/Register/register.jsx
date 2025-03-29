import { Class } from "@mui/icons-material"
import "./register.css"
import { useRef,useContext } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { useAuth0 } from '@auth0/auth0-react';

import { AuthContext } from "../context/AuthContext";


function Register() {
    const firstName = useRef()
    const lastName = useRef();
    const email = useRef();
    const password = useRef();
    const passwordAgain = useRef();
    const userRole = useRef(null)
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
      };
   
    const handleClick = async (e) => {
        e.preventDefault();
        if (passwordAgain.current.value !== password.current.value) {
            passwordAgain.current.setCustomValidity("Password don't match")
        } else {
            const user = {
                firstName: firstName.current.value,
                lastName: lastName.current.value,
                email: email.current.value,
                password: password.current.value,
                userRole: userRole.current.value,
                
            };
            console.log(user)
            console.log("creating user")
            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/register`, user);
                


            } catch (err) {
                console.log(err)
            }
        }
    }

    // Redirect to home if login is successful

    return (
        <div className="login">
            <div className="loginWrapper">
                <div className="loginLeft">
                    <h3 className="loginLogo">Streamlined Trucking</h3>
                    <span className="loginDesc">
                        Easy way to manage your trucks
                    </span>
                </div>
                <div className="loginRight">
                    <form className="loginBox" onSubmit={handleClick}>
                        <input
                            placeholder="First Name"
                            required
                            ref={firstName}
                            className="loginInput"
                            data-testid="firstName"
                        />
                        <input
                            placeholder="Last Name"
                            required
                            ref={lastName}
                            className="loginInput"
                            data-testid="lastName"
                        />
                        <input
                            placeholder="Email"
                            required
                            ref={email}
                            className="loginInput"
                            data-testid="email"
                        />
                        <input
                            placeholder="Password"
                            required
                            ref={password}
                            className="loginInput"
                            type="password"
                            minLength="6"
                            data-testid="password"
                        />
                        <input
                            placeholder="Confirm Password"
                            required
                            ref={passwordAgain}
                            className="loginInput"
                            type="password"
                            data-testid="passwordAgain"
                        />

                        <label>
                            <input
                                required
                                name="option"
                                type="radio"
                                value="Driver"
                                className="radioLoginInput"
                                ref={userRole}
                                data-testid="driver"
                                
                                
                            />
                            Driver
                        </label>
                        <label>
                            <input
                                required
                                name="option"
                                type="radio"
                                value="VehicleOwner"
                                className="radioLoginInput"
                                ref={userRole}
                                data-testid="vehicleOwner"
                            />
                            Vehicle Owner
                        </label>

                        <button className="loginButton" type="submit" data-testid="signUp">Sign Up
                        </button>
                        <button className="loginRegisterButton" onClick={handleLoginClick} data-testid="logIn">Log In
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
