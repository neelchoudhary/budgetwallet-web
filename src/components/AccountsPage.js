import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, toggleAccountSelectionAPI, updateInstitutionAPI, updateAccountsAPI } from '../utils/api'
import { PlaidLink } from 'react-plaid-link';


export default class AccountsPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            connectedInstitutions: []
        }

        this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
        this.updateInstitutionState = this.updateInstitutionState.bind(this)
        this.toggleAccountSelect = this.toggleAccountSelect.bind(this)
        this.addInstitution = this.addInstitution.bind(this)
        this.onAddInstitutionSuccess = this.onAddInstitutionSuccess.bind(this)
    }

    componentDidMount() {
        // make api calls
        this.fetchConnectedAccounts()
    }

    fetchConnectedAccounts() {
        getInstitutionsAPI()
            .then((institutions) => {
                this.setState({
                    connectedInstitutions: institutions
                })
                let promises = [];
                for (let institution of institutions) {
                    promises.push(getAccountsFromInstitutionIDAPI(institution.id))
                }

                Promise.all(promises)
                    .then((allAccounts) => {
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

    updateInstitutionState(accounts) {
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

    toggleAccountSelect(itemId, accountId, selected) {
        toggleAccountSelectionAPI(itemId, accountId, selected)
            .then(() => {
                // this.fetchConnectedAccounts()
                this.setState(state => {
                    const connectedInstitutions = state.connectedInstitutions.map((inst, index) => {
                        if (inst.id === itemId) {
                            inst.accounts = inst.accounts.map((account, index) => {
                                if (account.id === accountId) {
                                    account.selected = selected
                                    return account
                                } else {
                                    return account
                                }
                            })
                            return inst
                        } else {
                            return inst
                        }
                    });

                    return {
                        connectedInstitutions: connectedInstitutions,
                    };
                });
            }).catch((error) => {
                console.warn("Error fetching toggling account: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    addInstitution() {

    }

    onAddInstitutionSuccess(token, metadata) {

    }

    render() {
        return (
            <div className='accounts-page'>
                <div className='row'>
                    <h3 className='page-title'>Accounts</h3>
                    <button className='accounts-connect-btn' onClick={this.addInstitution}>Connect Account</button>
                    {/* <PlaidLink className='accounts-connect-btn'
                        clientName='Plaid Quickstart'
                        // countryCodes=['US']
                        env='development'
                        token=''
                        // product=['transactions']
                        //   webhook: "https://neelchoudhary.com:1443/webhook/1",
                        language='en'
                        onSuccess={this.onAddInstitutionSuccess}>
                        Connect Account
                    </PlaidLink> */}
                </div>
                <InstitutionsList institutions={this.state.connectedInstitutions} toggleAccountSelect={this.toggleAccountSelect} fetchConnectedAccounts={this.fetchConnectedAccounts} />
            </div>
        )
    }
}

function InstitutionsList({ institutions, toggleAccountSelect, fetchConnectedAccounts }) {
    return (
        <ul className='institutions-list'>
            {institutions.map((institution, index) => {
                return (
                    <InstitutionTile key={index} institution={institution} toggleAccountSelect={toggleAccountSelect} fetchConnectedAccounts={fetchConnectedAccounts} />
                )
            })}
        </ul>
    )
}


class InstitutionTile extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            manageMenuActive: false,
            loading: false,
        }
    }


    expandManageMenu = () => {
        this.setState({
            manageMenuActive: !this.state.manageMenuActive
        })
    }

    updateAccounts = (itemId) => {
        this.setState({ loading: true })
        updateInstitutionAPI(itemId)
            .then(() => {
                // this.fetchConnectedAccounts()
                updateAccountsAPI(itemId)
                    .then(() => {
                        this.props.fetchConnectedAccounts()
                        this.setState({ loading: false, manageMenuActive: false })
                    })
            }).catch((error) => {
                this.setState({ loading: false, manageMenuActive: false })
                console.warn("Error fetching toggling account: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    render() {
        const moreOptionsStyle = {
            display: this.state.manageMenuActive ? "block" : "none",
        };
        const loaderStyle = {
            display: this.state.loading ? "block" : "none",
        };
        const { institution, toggleAccountSelect } = this.props
        const { id, name, status, logo, accounts } = institution
        return (
            <div className='institution-card'>
                <div className='institution-header'>
                    <div className='row'>
                        <h3 className='institution-title'>{name}</h3>
                        {status === "Connected" ?
                            <img className='institution-status-img' src={require('../images/check-circle.svg')} alt='Connected'></img> :
                            <img className='institution-status-img' src={require('../images/error-circle.svg')} alt='Error'></img>
                        }

                        {/* <h3>{status}</h3> */}
                    </div>
                    <div className="loader" style={loaderStyle}></div>
                    <div className='row institution-manage' onClick={this.expandManageMenu}>
                        <h3>Manage</h3>
                        <img className='institution-expand-img' src={require('../images/expand-down.svg')} alt=''></img>
                        <div className="dropdown-content" style={moreOptionsStyle}>
                            <a onClick={() => this.updateAccounts(id)}>Update Account</a>
                            <a href="#/">Edit Connection</a>
                            <a href="#/">Remove Account</a>
                        </div>
                    </div>
                </div>
                < hr className='institution-line' />
                <AccountsList accounts={accounts} logo={logo} toggleAccountSelect={toggleAccountSelect} />
            </div>
        )
    }

}

function AccountsList({ accounts, logo, toggleAccountSelect }) {
    return (
        <ul className='accounts-list'>
            {accounts.map((account, index) => {
                const { id, itemId, name, mask, balance, selected } = account
                return (
                    <li key={id}>
                        <AccountCard name={name} mask={mask} balance={balance} selected={selected} logo={logo} accountId={id} itemId={itemId} toggleAccountSelect={toggleAccountSelect} />
                    </li>
                )
            })}
        </ul>
    )
}

class AccountCard extends React.Component {
    render() {
        const { name, mask, balance, selected, logo, accountId, itemId, toggleAccountSelect } = this.props
        return (
            <div className='account-card'>
                <div className='account-card-left-side'>
                    <img
                        className='account-logo'
                        src={`data:image/jpeg;base64,${logo}`}
                        alt='Logo'
                    />
                    <div className='account-details'>
                        <h2 className='header-large'>
                            {`${name} ****${mask}`}
                        </h2>
                        <h2 className='header-small'>
                            {`$${balance.toFixed(2)}`}
                        </h2>
                    </div>
                </div>
                <input className='account-checkbox' type="checkbox" checked={selected} onChange={() => toggleAccountSelect(itemId, accountId, !selected)} />
            </div>
        )
    }
}