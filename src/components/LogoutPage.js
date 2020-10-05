import React from 'react'
import { Redirect } from 'react-router-dom'
import { signOutAPI } from '../utils/api'

export default class LogoutPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loggedOut: false,
        }

        this.logout = this.logout.bind(this)
    }

    componentDidMount() {
        // logout
        this.logout()
    }

    logout() {
        // Delete token cookie
        signOutAPI()
            .then(() => {
                this.setState({ loggedOut: true })
            }).catch((error) => {
                console.warn("Error logging out: " + error)
                this.setState({ loggedOut: false })
            })
    }


    render() {
        if (this.state.loggedOut === true) {
            return <Redirect to="/login" />;
        } else {
            return null
        }
    }

}