import React from 'react';
import SideNavBar from './components/SideNavBar';
import AccountsPage from './components/AccountsPage';
import { Route, Switch, Redirect } from 'react-router-dom'
import LogoutPage from './components/LogoutPage';
import TransactionsPage from './components/TransactionsPage';
import LoginPage from './components/LoginPage';


export default class AuthedApp extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      isAuthed: true, // FOR DEVELOPMENT ONLY
      onLogin: () => {
        this.setState({ isAuthed: true });
      },
      onLogout: () => {
        this.setState({ isAuthed: false });
      },
    }

  }

  render() {

    const { isAuthed, onLogin, onLogout } = this.state

    return (
      <div>
        <Switch>
          <Route exact path='/login' render={props =>
            <div className="App">
              <LoginPage onLogin={onLogin} isAuthed={isAuthed} />
            </div>} />
          <Route exact path='/transactions' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <TransactionsPage />
            </AuthRequired>
          )} />
          <Route exact path='/accounts' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <AccountsPage/>
            </AuthRequired>
          )} />
          <Route exact path='/logout' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <LogoutPage onLogout={onLogout}/>
            </AuthRequired>
          )} />
          <Route render={props =>
            <div className="App">
              <SideNavBar />
              <h1>404 Page Not Found</h1>
            </div>} />
        </Switch>
      </div>
    )
  }
}

function AuthRequired({ isAuthed, children }) {
  return (isAuthed === false) ?
    <Redirect to="/login" /> :
    (<div className="App">
      {children}
    </div>)
}