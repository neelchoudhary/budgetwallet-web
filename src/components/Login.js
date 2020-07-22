import React from 'react'

export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: ""
        }
    }

    handleChange = (event, field) => {
        this.setState({
            [field]: event.target.value
        })
    }

    render() {
        return (
            <div>
                <h1>Sign In</h1>
                <form>
                    <div>
                        <input className="form-fields" type="text" placeholder="Email" value={this.state.email} onChange={(event) => this.handleChange(event, "email")} required />
                    </div>
                    <div>
                        <input className="form-fields" type="text" placeholder="Password" value={this.state.password} onChange={(event) => this.handleChange(event, "password")} required />
                    </div>
                    <div>
                        <input className="form-fields" type="submit" name="submit" value="Log In" />
                    </div>
                </form>
            </div>)
    }

}