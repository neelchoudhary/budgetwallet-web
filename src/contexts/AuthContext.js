import React from 'react'

const AuthContext = React.createContext();

export const AuthConsumer = AuthContext.Consumer;

// Currently not in use. 
export class AuthProvider extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isAuthed: false,
            onLogin: () => {
                this.setState({ isAuthed: true });
            },
            onLogout: () => {
                this.setState({ isAuthed: false });
            }
        }
    }

    render() {
        return (
            <AuthContext.Provider value={this.state}>
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}