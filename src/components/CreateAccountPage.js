import React from 'react'
import { signupAPI } from '../utils/api'
import { Redirect } from 'react-router-dom'

export default class CreateAccountPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            name: "",
            email: "",
            password: "",
            repassword: "",
            signUpError: "",
        }

        this.signUp = this.signUp.bind(this)
    }

    signUp(event) {
        event.preventDefault()
        var ele = document.getElementById("sign-up-form");
        var formStatus = ele.checkValidity();
        ele.reportValidity();
        if (formStatus) {
            if (this.state.password !== this.state.repassword) { 
                this.setState({ loginError: "Passwords did not match, please re-enter and try again." })
                return false; 
            } 
            
            signupAPI(this.state.name, this.state.email, this.state.password)
                .then(() => {
                    this.props.onLogin()
                }).catch((error) => {
                    console.warn("Error signing in: " + error)
                    this.setState({ loginError: "Something went wrong, please try again." })
                })
        }
    }

    handleChange = (event, field) => {
        this.setState({
            [field]: event.target.value
        })
    }

    render() {
        if (this.props.isAuthed === true) {
            return <Redirect to="/accounts" />;
        }

        return (
            <div className='sign-up-page'>
                <div className='sign-up-container'>
                    <h1 className='sign-in-header'> Create an Account</h1>
                    <form className='sign-in-form' id='sign-up-form'>
                        <div className='form-input'>
                            <label htmlFor="name-form">Full Name</label>
                            <input className="form-field" id='name-form' type="text" placeholder="John Smith" value={this.state.name} onChange={(event) => this.handleChange(event, "name")} required />
                        </div>
                        <div className='form-input'>
                            <label htmlFor="email-form">Email</label>
                            <input className="form-field" id='email-form' type="text" placeholder="johnsmith@domain.com" value={this.state.email} onChange={(event) => this.handleChange(event, "email")} required />
                        </div>
                        <div className='form-input'>
                            <label htmlFor="password-form">Password</label>
                            <input className="form-field"  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="Password must contain at least one number, one uppercase character, one lowercase character, and at least 8 or more characters" id='password-form' type="password" placeholder="my password" value={this.state.password} onChange={(event) => this.handleChange(event, "password")} required />
                        </div>
                        <div className='form-input'>
                            <label htmlFor="repassword-form">Confirm Password</label>
                            <input className="form-field" id='repassword-form' type="password" placeholder="my password" value={this.state.repassword} onChange={(event) => this.handleChange(event, "repassword")} required />
                        </div>
                        <p className='error-text' style={{ "display": this.state.loginError === "" ? "none" : "inherit" }}>{this.state.loginError}</p>
                        <div>
                            <input className="form-submit" type="submit" name="submit" value="Sign up" onClick={this.signUp} />
                        </div>
                        <div className='row sign-in-options'>
                            <a href="login">Already have an account?</a>
                        </div>
                    </form>
                </div>
            </div>)
    }

}