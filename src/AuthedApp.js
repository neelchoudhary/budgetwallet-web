import React from 'react';
import SideNavBar from './components/SideNavBar';
import AccountsPage from './components/AccountsPage';
import { Route, Switch, Redirect } from 'react-router-dom'
import LogoutPage from './components/LogoutPage';
import TransactionsPage from './components/TransactionsPage';
import LoginPage from './components/LoginPage';
import HistoryPage from './components/HistoryPage';
import CreateAccountPage from './components/CreateAccountPage';
import DashboardPage from './components/DashboardPage';
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getTransactionsAPI, getCategoriesAPI } from './utils/api'
import { DataProvider, DataConsumer } from './contexts/DataContext'


export default class AuthedApp extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      isAuthed: true, // FOR DEVELOPMENT ONLY (should be false)
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
          <Route exact path='/signup' render={props =>
            <div className="App">
              <CreateAccountPage onLogin={onLogin} isAuthed={isAuthed} />
            </div>} />
          <Route exact path='/dashboard' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <DataConsumer>
                {({ connectedInstitutions, transactions, categories, loading }) => (
                  <DashboardPage connectedInstitutions={connectedInstitutions} transactions={transactions} categories={categories} loading={loading} />
                )}
              </DataConsumer>
            </AuthRequired>
          )} />
          <Route exact path='/history' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <DataConsumer>
                {({ connectedInstitutions, loading }) => (
                  <HistoryPage connectedInstitutions={connectedInstitutions} loading={loading} />
                )}
              </DataConsumer>
            </AuthRequired>
          )} />
          <Route exact path='/transactions' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <TransactionsPage />
            </AuthRequired>
          )} />
          <Route exact path='/accounts' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <AccountsPage />
            </AuthRequired>
          )} />
          <Route exact path='/logout' render={props => (
            <AuthRequired isAuthed={isAuthed}>
              <SideNavBar />
              <LogoutPage onLogout={onLogout} />
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

class AuthRequired extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      connectedInstitutions: [],
      categories: [],
      transactions: [],
      fetchConnectedAccounts: () => this.fetchConnectedAccounts(),
      loading: true,
    }

    this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
    this.updateInstitutionState = this.updateInstitutionState.bind(this)
    this.fetchCategories = this.fetchCategories.bind(this)
    this.fetchTransactions = this.fetchTransactions.bind(this)
  }

  async componentDidMount() {
    // make api calls
    if (this.props.isAuthed === true) {
      await this.fetchCategories()
      await this.fetchConnectedAccounts()
      await this.fetchTransactions()
      this.setState({loading: false})
    }
  }

  // Gets all accounts and institutions from server (no dependencies)
  async fetchConnectedAccounts() {
    console.log("START FETCH INSTITUTIONS")
    await getInstitutionsAPI()
      .then(async (institutions) => {
        console.log("END FETCH INSTITUTIONS")
        this.setState({
          connectedInstitutions: institutions
        })
        let promises = [];
        for (let institution of institutions) {
          promises.push(await getAccountsFromInstitutionIDAPI(institution.id))
        }

        console.log("START FETCH ACCOUNTS")
        Promise.all(promises)
          .then((allAccounts) => {
            console.log("END FETCH ACCOUNTS")
            for (let accounts of allAccounts) {
              this.updateInstitutionState(accounts)
            }
          })
      })
      .catch((error) => {
        console.warn("Error fetching account info: " + error)
        // this.setState({
        //     error: 'There was an error fetching the account info.'
        // })
      })
  }

  // match institutions with accounts (dependent on connectedInstitutions) 
  updateInstitutionState(accounts) {
    console.log("START & END UPDATE INSTITUTION STATE")
    this.setState(state => {
      const connectedInstitutions = state.connectedInstitutions.map((inst, index) => {
        if (inst.id === accounts.institutionId) {
          inst.accounts = accounts.accounts;
          return inst
        } else {
          return inst
        }
      });

      return {
        connectedInstitutions: connectedInstitutions,
      };
    });
  }

  // Gets categories from server (no dependencies)
  async fetchCategories() {
    console.log("START GET CATEGORIES")
    await getCategoriesAPI()
      .then((fetchedCategories) => {
        console.log("END GET CATEGORIES")
        this.setState({ categories: fetchedCategories })
      })
      .catch((error) => {
        console.warn("Error fetching transactions: " + error)
        // this.setState({
        //     error: 'There was an error fetching the account info.'
        // })
      })
  }

  // Gets transactions from server (dependent on connectedInstitutions & categories)
  async fetchTransactions() {
    console.log("START GET TRANSACTIONS")
    await getTransactionsAPI()
      .then((fetchedTransactions) => {
        fetchedTransactions.map((t) => {
          let itemId = t.itemId
          let accountId = t.accountId
          let categoryId = t.categoryId

          let inst = this.state.connectedInstitutions.find((inst) => inst.id === itemId)
          t.instLogo = inst.logo
          t.instColor = inst.color
          t.instName = inst.name

          let account = inst.accounts.find((account) => account.id === accountId)
          t.accountMask = account.mask

          let category = this.state.categories.find((c) => c.id === categoryId)
          t.category = category.category
          return t
        })
        console.log("END GET TRANSACTIONS")
        this.setState({ transactions: fetchedTransactions })
      })
      .catch((error) => {
        console.warn("Error fetching transactions: " + error)
        // this.setState({
        //     error: 'There was an error fetching the account info.'
        // })
      })
  }

  render() {
    const { isAuthed, children } = this.props
    return (isAuthed === false) ?
      <Redirect to="/login" /> :
      (<div className="App">
        <DataProvider value={this.state}>
          {children}
        </DataProvider>
      </div>)
  }
}