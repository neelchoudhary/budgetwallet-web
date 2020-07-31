import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getTransactionsAPI, getCategoriesAPI, getMonthlyAccountSnapshotsAPI } from '../utils/api'
import Badge from 'react-bootstrap/Badge';


export default class DashboardPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            connectedInstitutions: [],
            networth: {
                total: 0,
                checkings: {
                    total: 0,
                    pct: 0,
                    monthChange: 0
                },
                savings: {
                    total: 0,
                    pct: 0,
                    monthChange: 0
                },
                investment: {
                    total: 0,
                    pct: 0,
                    monthChange: 0
                },
                credit: {
                    total: 0,
                    pct: 0,
                    monthChange: 0
                },
                loans: {
                    total: 0,
                    pct: 0,
                    monthChange: 0
                }
            }
        }

        this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
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
                    }).then(() => {
                        this.calculateNetworth()
                    }).then(() => {
                        this.fetchTotalMonthlySnapshots()
                    })
                // this.fetchCategories()
                // this.fetchTransactions()
            })
            .catch((error) => {
                console.warn("Error fetching account info: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })
    }

    fetchTotalMonthlySnapshots() {
        this.state.connectedInstitutions.forEach((inst) => {
            inst.accounts.forEach((account) => {
                getMonthlyAccountSnapshotsAPI(account.id)
                    .then((fetchedMonthlySnapshots) => {
                        console.log(fetchedMonthlySnapshots)
                        const monthlyChangeIn = fetchedMonthlySnapshots[0].cashIn ?? 0;
                        const monthlyChangeOut = fetchedMonthlySnapshots[0].cashOut ?? 0;
                        const monthlyChange = monthlyChangeIn - monthlyChangeOut;

                        let accountType = 0
                        if (account.subtype === "checking") {
                            accountType = 0
                        } else if (account.subtype === "savings") {
                            accountType = 1
                        } else if (account.type === "credit") {
                            accountType = 2
                        } else if (account.type === "investment") {
                            accountType = 3
                        } else if (account.type === "loans") {
                            accountType = 4
                        }

                        this.setState(({ networth }) => ({
                            networth: {
                                ...networth,
                                checkings: {
                                    ...networth.checkings,
                                    monthChange: networth.checkings.monthChange + ((accountType === 0) ? monthlyChange : 0),
                                },
                                savings: {
                                    ...networth.savings,
                                    monthChange: networth.savings.monthChange + (accountType === 1) ? monthlyChange : 0,
                                },
                                credit: {
                                    ...networth.credit,
                                    monthChange: networth.credit.monthChange + (accountType === 2) ? monthlyChange : 0,
                                },
                                investment: {
                                    ...networth.investment,
                                    monthChange: networth.investment.monthChange + (accountType === 3) ? monthlyChange : 0,
                                },
                                loans: {
                                    ...networth.loans,
                                    monthChange: networth.loans.monthChange + (accountType === 4) ? monthlyChange : 0,
                                }
                            }
                        }))
                    })
                    .catch((error) => {
                        console.warn("Error fetching transactions: " + error)
                        // this.setState({
                        //     error: 'There was an error fetching snapshot info.'
                        // })
                    })
            })
        })
    }

    calculateNetworth = () => {
        let checkings = 0;
        let savings = 0;
        let investment = 0;
        let credit = 0;
        let loans = 0;
        const networthTotal = this.state.connectedInstitutions.reduce((networth, inst) => {
            return networth + inst.accounts.reduce((instNetworth, account) => {
                if (account.type === "depository") {
                    if (account.subtype === "checking") {
                        checkings += account.balance
                    } else if (account.subtype === "savings") {
                        savings += account.balance
                    }
                } else if (account.type === "investment") {
                    investment += account.balance
                } else if (account.type === "credit") {
                    credit += account.balance
                    return instNetworth - account.balance;
                } else if (account.type === "loans") {
                    loans += account.balance
                }
                return instNetworth + account.balance;
            }, 0)
        }, 0).toFixed(2)
        const networth = {
            total: this.numberWithCommas(networthTotal),
            checkings: {
                total: this.numberWithCommas(checkings.toFixed(2)),
                pct: (checkings * 100 / networthTotal).toFixed(2),
                monthChange: 0
            },
            savings: {
                total: this.numberWithCommas(savings.toFixed(2)),
                pct: (savings * 100 / networthTotal).toFixed(2),
                monthChange: 0
            },
            investment: {
                total: this.numberWithCommas(investment.toFixed(2)),
                pct: (investment * 100 / networthTotal).toFixed(2),
                monthChange: 0
            },
            credit: {
                total: this.numberWithCommas(credit.toFixed(2)),
                pct: (credit * 100 / networthTotal).toFixed(2),
                monthChange: 0
            },
            loans: {
                total: this.numberWithCommas(loans.toFixed(2)),
                pct: (loans * 100 / networthTotal).toFixed(2),
                monthChange: 0
            }

        }
        this.setState({ networth: networth })
    }

    numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                        t.instLogo = inst.logo
                        t.instColor = inst.color
                        t.instName = inst.name

                        let account = inst.accounts.find((account) => account.id === accountId)
                        t.accountMask = account.mask

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
        const { networth } = this.state
        const { total, checkings, savings, investment, credit, loans } = networth
        // const { networth, checkings, savings, investment, credit, loans,
        //     checkingsPct, savingsPct, investmentPct, creditPct, loansPct } = this.state
        return (
            <div className='page'>
                <div className='dashboard-page'>
                    <p className='dashboard-networth-title'>Net Worth</p>
                    <h3 className='page-title'>${total}</h3>
                    <p>Net Worth Breakdown (down-arrow)</p>

                    <div className='networth-breakdown-div'>
                        <div className='left-side'>
                            <p>Checkings ({checkings.pct}%)</p>
                            <h2>${checkings.total}</h2>
                        </div>
                        <div className='right-side'>
                            <p>This month</p>
                            <h2>${this.numberWithCommas(checkings.monthChange.toFixed(2))}</h2>
                        </div>
                    </div>
                    <div className='networth-breakdown-div'>
                        <div className='left-side'>
                            <p>Savings ({savings.pct}%)</p>
                            <h2>${savings.total}</h2>
                        </div>
                        <div className='right-side'>
                            <p>This month</p>
                            <h2>${this.numberWithCommas(savings.monthChange.toFixed(2))}</h2>
                        </div>
                    </div>
                    <div className='networth-breakdown-div'>
                        <div className='left-side'>
                            <p>Investments ({investment.pct}%)</p>
                            <h2>${investment.total}</h2>
                        </div>
                        <div className='right-side'>
                            <p>This month</p>
                            <h2>${this.numberWithCommas(investment.monthChange.toFixed(2))}</h2>
                        </div>
                    </div>
                    <div className='networth-breakdown-div'>
                        <div className='left-side'>
                            <p>Credit ({credit.pct}%)</p>
                            <h2>${credit.total}</h2>
                        </div>
                        <div className='right-side'>
                            <p>This month</p>
                            <h2>${this.numberWithCommas(credit.monthChange.toFixed(2))}</h2>
                        </div>
                    </div>
                    <div className='networth-breakdown-div'>
                        <div className='left-side'>
                            <p>Loans ({loans.pct}%)</p>
                            <h2>${loans.total}</h2>
                        </div>
                        <div className='right-side'>
                            <p>This month</p>
                            <h2>${this.numberWithCommas(loans.monthChange.toFixed(2))}</h2>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


function TransactionsCard({ id, img, name, amount, date, pending, category, accountMask, instLogo, instColor, instName }) {
    return (
        <div className='transaction-card row'>
            <div className='row'>
                <img className='transaction-category-img' src={require(`../images/categories/${img}`)} alt=''></img>

                <div style={{ "maxWidth": "30vw" }}>
                    <div className='row transaction-category-div'>
                        <h3 id='category-text'>{category}</h3>
                        {pending && <Badge variant="secondary">Pending</Badge>}
                    </div>
                    <h3 id='name-text'>{name}</h3>
                </div>
            </div>


            <div className='row'>
                <div>
                    <h3 id='amount-text'>${amount.toFixed(2)}</h3>
                    <h3 id='date-text'>{date}</h3>
                </div>
                <div className='row account-info-container'>
                    {instLogo ?
                        <img className='account-logo' src={`data:image/jpeg;base64,${instLogo}`} alt='Logo' /> :
                        <div className='account-logo-backup' style={{ "backgroundColor": instColor }}>{instName.slice(0, 1)}</div>
                    }
                    <h3 id='mask-text'>****{accountMask}</h3>
                </div>
            </div>
        </div>
    )
}