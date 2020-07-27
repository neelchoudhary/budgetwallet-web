import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getTransactionsAPI, getCategoriesAPI } from '../utils/api'
import { FaUtensils } from "react-icons/fa";


export default class TransactionsPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transactions: [],
            connectedInstitutions: [],
            categories: []
        }

        this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
        this.updateInstitutionState = this.updateInstitutionState.bind(this)
        this.fetchCategories = this.fetchCategories.bind(this)
        this.fetchTransactions = this.fetchTransactions.bind(this)
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
                this.fetchCategories()
                this.fetchTransactions()
                // this.setState({ready: true})

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


    fetchCategories() {
        getCategoriesAPI()
            .then((fetchedCategories) => {
                this.setState({ categories: fetchedCategories })
            })
            .catch((error) => {
                console.warn("Error fetching transactions: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    fetchTransactions() {
        this.state.connectedInstitutions.forEach((inst) => {
            getTransactionsAPI(inst.id)
                .then((fetchedTransactions) => {
                    fetchedTransactions.map((t) => {
                        let itemId = t.itemId
                        let accountId = t.accountId
                        let categoryId = t.categoryId

                        let inst = this.state.connectedInstitutions.find((inst) => inst.id === itemId)
                        t.logo = inst.logo
                        t.instColor = inst.color

                        let account = inst.accounts.find((account) => account.id === accountId)
                        t.mask = account.mask

                        let category = this.state.categories.find((c) => c.id === categoryId)
                        t.category = category.category
                        return t
                    })
                    this.setState(({ transactions }) => {
                        const newTransactions = [...transactions, ...fetchedTransactions]
                        return { transactions: newTransactions };
                    })
                })
                .catch((error) => {
                    console.warn("Error fetching transactions: " + error)
                    // this.setState({
                    //     error: 'There was an error fetching the account info.'
                    // })
                })
        })
    }

    render() {
        return (
            <div className='transactions-page'>
                <div className='row'>
                    <h3 className='page-title'>Transactions</h3>
                </div>
                {/* <input type='text' placeholder='Search...'></input> */}
                <TransactionsList transactions={this.state.transactions} />
            </div>
        )
    }
}

function TransactionsList({ transactions }) {
    transactions.sort((t1,t2) => t2.date.localeCompare(t1.date))

    return (
        <ul className='transactions-list'>
            {transactions.map((transaction, index) => {
                const { id, img, name, amount, date, pending, category, mask, logo, instColor, categoryId, itemId, accountId } = transaction
                return (
                    <li key={id}>
                        <TransactionsCard id={id} img={img} name={name} amount={amount} date={date} pending={pending} category={category} mask={mask} logo={logo} instColor={instColor} categoryId={categoryId} itemId={itemId} accountId={accountId} />
                    </li>
                )
            })}
        </ul>
    )
}

function TransactionsCard({ id, img, name, amount, date, pending, category, mask, logo, instColor, categoryId, itemId, accountId }) {
    return (
        <div className='transaction-card row'>
            <div className='row'>
                <FaUtensils size={35} id='category-img' />
                <div>
                    <h3 id='category-text' >{category}</h3>
                    <h3 id='name-text' >{name}</h3>
                </div>
            </div>


            <div className='row'>
                <div>
                    <h3 id='amount-text'>${amount.toFixed(2)}</h3>
                    <h3 id='date-text'>{date}</h3>
                </div>
                <div className='row account-info-container'>
                    <img
                        className='account-logo'
                        src={`data:image/jpeg;base64,${logo}`}
                        alt='Logo'
                    />
                    <h3 id='mask-text'>****{mask}</h3>
                </div>
            </div>

            {/* <h3 id='mask-text'>{pending ? 'pending' : ''}</h3> */}
        </div>
    )
}