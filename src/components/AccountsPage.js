import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, toggleAccountSelectionAPI, updateInstitutionAPI, updateAccountsAPI, getLinkTokenAPI, linkBankAccountAPI, removeBankAccountAPI } from '../utils/api'
import { usePlaidLink } from 'react-plaid-link';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


export default class AccountsPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            connectedInstitutions: [],
            linkToken: ""
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
        // Get Link Token from server
        getLinkTokenAPI()
            .then((linkToken) => {
                this.setState({ linkToken: linkToken })
            })
            .catch((error) => {
                console.warn("Error fetching link token: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    onAddInstitutionSuccess(token, metadata) {
        linkBankAccountAPI(token, metadata.institution.institution_id)
            .then(() => {
                this.fetchConnectedAccounts()
            })
            .catch((error) => {
                console.warn("Error adding new account: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    render() {
        return (
            <div className='page'>
                <div className='accounts-page'>
                    <div className='row'>
                        <h3 className='page-title'>Accounts</h3>
                        <button className='accounts-connect-btn' onClick={this.addInstitution}>Connect Account</button>
                        {this.state.linkToken !== "" &&
                            <PlaidLinkModal linkToken={this.state.linkToken} onCancel={() => this.setState({ linkToken: "" })} onLinkSuccess={(token, metadata) => this.onAddInstitutionSuccess(token, metadata)} />
                        }
                    </div>
                    <InstitutionsList institutions={this.state.connectedInstitutions} toggleAccountSelect={this.toggleAccountSelect} fetchConnectedAccounts={this.fetchConnectedAccounts} />
                </div>
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
            removeBankAttempt: false,
            removeBankID: -1
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

    attemptRemoveBank = (institutionId) => {
        this.setState({removeBankAttempt: true, removeBankID: institutionId})
     }

    cancelRemoveBank = () => {
        this.setState({removeBankAttempt: false, removeBankID: -1})
    }


    removeInstitution = (institutionId) => {
        removeBankAccountAPI(institutionId)
            .then(() => {
                this.props.fetchConnectedAccounts()
            })
            .catch((error) => {
                console.warn("Error removing account: " + error)
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
        const { id, name, status, logo, color, accounts } = institution
        return (
            <div className='institution-card'>
                <div className='institution-header'>
                    <div className='row'>
                        <h3 className='institution-title'>{name}</h3>
                        {status === "Connected" ?
                            <svg className='institution-status-img' fill='black' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg> :
                            <svg className='institution-status-img' fill='crimson' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                        }
                    </div>
                    <div className="loader" style={loaderStyle}></div>
                    <div className='row institution-manage' onClick={this.expandManageMenu}>
                        <h3>Manage</h3>
                        <img className='institution-expand-img' src={require('../images/expand-down.svg')} alt=''></img>
                        <div className="dropdown-content" style={moreOptionsStyle}>
                            <button onClick={() => this.updateAccounts(id)}>Update Accounts</button>
                            <button>Update Connection</button>
                            <button onClick={() => this.attemptRemoveBank(id)}>Remove Bank</button>
                        </div>
                    </div>
                </div>
                < hr className='institution-line' />
                <AccountsList accounts={accounts} instLogo={logo} instColor={color} instName={name} toggleAccountSelect={toggleAccountSelect} />
                {this.state.removeBankAttempt === true && <RemoveBankModal removeBankAccount={() => this.removeInstitution(this.state.removeBankID)} cancelModal={() => this.cancelRemoveBank()} />}
            </div>
        )
    }

}

function AccountsList({ accounts, instLogo, instColor, instName, toggleAccountSelect }) {
    return (
        <ul className='accounts-list'>
            {accounts.map((account) => {
                const { id, itemId, name, mask, balance, availableBalance, type, subtype, selected } = account
                return (
                    <li key={id}>
                        <AccountCard
                            name={name}
                            mask={mask}
                            balance={balance}
                            availableBalance={availableBalance}
                            type={type}
                            subtype={subtype}
                            selected={selected}
                            instLogo={instLogo}
                            instColor={instColor}
                            instName={instName}
                            accountId={id}
                            itemId={itemId}
                            toggleAccountSelect={toggleAccountSelect}
                        />
                    </li>
                )
            })}
        </ul>
    )
}

class AccountCard extends React.Component {
    render() {
        const { name, mask, balance, availableBalance, type, subtype, selected, instLogo, instColor, instName, accountId, itemId, toggleAccountSelect } = this.props
        return (
            <div className='account-card'>
                <div className='account-card-left-side'>
                    {instLogo ?
                        <img className='account-logo' src={`data:image/jpeg;base64,${instLogo}`} alt='Logo' /> :
                        <div className='account-logo-backup' style={{ "backgroundColor": instColor }}>{instName.slice(0, 1)}</div>
                    }
                    <div className='account-details'>
                        <h2 className='header-large'>
                            {`${name}`}
                        </h2>
                        <h2 className='header-small'>
                            {`$${balance.toFixed(2)} ∙ $${availableBalance.toFixed(2)} ∙ ${subtype}`}
                        </h2>
                    </div>
                </div>
                <div className='account-card-right-side'>
                    <h2 className='account-mask'>∙∙∙∙ {mask}</h2>
                </div>
                {/* <input className='account-checkbox' type="checkbox" checked={selected} onChange={() => toggleAccountSelect(itemId, accountId, !selected)} /> */}
            </div>
        )
    }
}


const PlaidLinkModal = ({ linkToken, onCancel, onLinkSuccess }) => {
    const onSuccess = React.useCallback((token, metadata) => {
        onLinkSuccess(token, metadata)
    }, []);

    const onExit = React.useCallback((error, metadata) => {
        onCancel()
    }, []);

    const config = {
        token: linkToken,
        onSuccess,
        onExit,
    };

    const { open, ready, error } = usePlaidLink(config);

    const [show, setShow] = React.useState(true);

    const handleContinue = () => {
        open()
        setShow(false)
    }
    const handleClose = () => onCancel();

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Connect Bank Account using Plaid</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Use Plaid to add your bank account.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                    Cancel
          </Button>
                <Button variant="primary" onClick={() => handleContinue()} disabled={!ready}>Continue</Button>
            </Modal.Footer>
        </Modal >
    );
};

function RemoveBankModal({ removeBankAccount, cancelModal }) {
    return (
        <Modal
            show={true}
            onHide={cancelModal}>
            <Modal.Header closeButton>
                <Modal.Title>Remove Bank Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to remove your bank account connection?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={cancelModal}>
                    Cancel
          </Button>
                <Button variant="danger" onClick={() => removeBankAccount()}>Continue</Button>
            </Modal.Footer>
        </Modal >
    );
}