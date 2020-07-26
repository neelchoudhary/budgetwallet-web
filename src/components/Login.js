import React from 'react'
import { signInAPI } from '../utils/api'
import { Redirect } from 'react-router-dom'

export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            loggedIn: false
        }

        this.signIn = this.signIn.bind(this)
    }

    signIn(event) {
        event.preventDefault()
        signInAPI(this.state.email, this.state.password)
            .then(() => {
                this.setState({loggedIn: true})
            }).catch((error) => {
                this.setState({loggedIn: false})
                console.warn("Error signing in: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })

    }

    handleChange = (event, field) => {
        this.setState({
            [field]: event.target.value
        })
    }

    render() {
        if (this.state.loggedIn === true) {
            return <Redirect to="/accounts" />;
        }

        return (
            <div className='sign-up-page'>
                <h1 className='sign-up-header'> Sign In</h1>
                <form className='sign-up-form'>
                    <div>
                        <input className="form-field" type="text" placeholder="Email" value={this.state.email} onChange={(event) => this.handleChange(event, "email")} required />
                    </div>
                    <div>
                        <input className="form-field" type="password" placeholder="Password" value={this.state.password} onChange={(event) => this.handleChange(event, "password")} required />
                    </div>
                    <div>
                        <input className="form-submit" type="submit" name="submit" value="Sign In" onClick={this.signIn} />
                    </div>
                </form>
            </div>)
    }

}