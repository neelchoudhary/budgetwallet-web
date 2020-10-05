import React from 'react'
import { signInAPI } from '../utils/api'
import { Redirect } from 'react-router-dom'

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            loginError: "",
            isAuthed: false,
        }

        this.signIn = this.signIn.bind(this)
    }

    signIn(event) {
        event.preventDefault()
        var ele = document.getElementById("sign-in-form");
        var formStatus = ele.checkValidity();
        ele.reportValidity();
        if (formStatus) {
            signInAPI(this.state.email, this.state.password)
                .then(() => {
                    this.setState({ isAuthed: true })
                }).catch((error) => {
                    console.warn("Error signing in: " + error)
                    if (error.message === "Auth error") {
                        this.setState({ loginError: "Incorrect email/password combination, please try again.", isAuthed: false })
                    } else {
                        this.setState({ loginError: "Something went wrong, please try again.", isAuthed: false })
                    }
                })
        }
    }

    handleChange = (event, field) => {
        this.setState({
            [field]: event.target.value
        })
    }

    render() {
        if (this.state.isAuthed === true) {
            return <Redirect to="/accounts" />;
        }

        return (
            <div className='sign-in-page'>
                <div className='sign-in-container'>
                    <h1 className='sign-in-header'> Sign in</h1>
                    <form className='sign-in-form' id='sign-in-form'>
                        <div className='form-input'>
                            <label htmlFor="email-form">Email</label>
                            <input className="form-field" id='email-form' type="text" placeholder="johnsmith@domain.com" value={this.state.email} onChange={(event) => this.handleChange(event, "email")} required />
                        </div>
                        <div className='form-input'>
                            <label htmlFor="password-form">Password</label>
                            <input className="form-field" id='password-form' type="password" placeholder="my password" value={this.state.password} onChange={(event) => this.handleChange(event, "password")} required />
                        </div>
                        <p className='error-text' style={{ "display": this.state.loginError === "" ? "none" : "inherit" }}>{this.state.loginError}</p>
                        <div>
                            <input className="form-submit" type="submit" name="submit" value="Sign in" onClick={this.signIn} />
                        </div>
                        <div className='row sign-in-options'>
                            <a href="signup">Create an Account</a>
                            <a href="/#">Forgot my Password</a>
                        </div>
                    </form>
                </div>
            </div>)
    }

}