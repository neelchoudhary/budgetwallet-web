import React from 'react';
import Login from './components/Login';
import SideNavBar from './components/SideNavBar';
import AccountsPage from './components/AccountsPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Logout from './components/Logout';

function App() {
  return (
    <div className="App">
      <SideNavBar />
      <Switch>
        <Route exact path='/login' component={Login} />
        <Route exact path='/accounts' component={AccountsPage} />
        <Route exact path='/logout' component={Logout} />
        <Route render={() => (<h1>404 Page Not Found</h1>)} />
      </Switch>

    </div>
  );
}

export default App;
