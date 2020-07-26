import React from 'react'
import { signOutAPI } from '../utils/api'
import { Redirect } from 'react-router-dom'

export default class Logout extends React.Component {

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
                this.setState({ loggedOut: true })
            })
    }


    render() {
        if (this.state.loggedOut === true) {
            return <Redirect to="/login" />;
        }
        return null
    }

}