import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getTransactionsAPI, getCategoriesAPI, getMonthlyAccountSnapshotsAPI, getMonthlyCategorySnapshotsAPI, getRecurringTransactionsAPI } from '../utils/api'
import Badge from 'react-bootstrap/Badge';


export default class DashboardPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            categorySnapshots: [],
            recurringTransactions: [],
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
            },
            sourcesMenu: 0, // 0 is spending, 1 is income.
        }
    }

    async componentDidMount() {
        // make api calls
        if (this.props.loading === false) {
            this.calculateNetworth()
            this.fetchTotalMonthlySnapshots()
            this.fetchMonthlyCategorySnapshots()
            this.fetchRecurringTransactions()
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.loading !== this.props.loading && this.props.loading === false) {
            this.calculateNetworth()
            this.fetchTotalMonthlySnapshots()
            this.fetchMonthlyCategorySnapshots()
            this.fetchRecurringTransactions()
        }
    }

    fetchTotalMonthlySnapshots() {
        this.props.connectedInstitutions.forEach((inst) => {
            inst.accounts.forEach((account) => {
                getMonthlyAccountSnapshotsAPI(account.id)
                    .then((fetchedMonthlySnapshots) => {
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
        const networthTotal = this.props.connectedInstitutions.reduce((networth, inst) => {
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

    fetchMonthlyCategorySnapshots() {
        getCategoriesAPI()
            .then((fetchedCategories) => {
                fetchedCategories.forEach((fetchedCategory) => {
                    getMonthlyCategorySnapshotsAPI(fetchedCategory.id)
                        .then((fetchedSnapshots) => {
                            this.setState(({ categorySnapshots }) => {
                                const categorySnapshot = {
                                    categoryId: fetchedCategory.id,
                                    categoryName: fetchedCategory.category,
                                    categoryImg: fetchedCategory.img,
                                    snapshots: fetchedSnapshots.snapshots,
                                    thisMonth: fetchedSnapshots.thisMonth,
                                    monthlyAverage: fetchedSnapshots.monthlyAverage
                                }
                                return { categorySnapshots: [...categorySnapshots, categorySnapshot] }
                            })
                        })
                })
            })
            .catch((error) => {
                console.warn("Error fetching transactions: " + error)
                // this.setState({
                //     error: 'There was an error fetching the account info.'
                // })
            })

    }

    fetchRecurringTransactions() {
        getRecurringTransactionsAPI()
            .then((fetchedRecurringTransactions) => {
                fetchedRecurringTransactions.map((rt) => {
                    let category = this.props.categories.find((c) => c.id === rt.categoryId)
                    rt.category = category.category
                    return rt
                })
                this.setState({ recurringTransactions: fetchedRecurringTransactions })
            })
            .catch((error) => {
                console.warn("Error fetching recurring transactions: " + error)
                // this.setState({
                //     error: 'There was an error fetching recurring transaction info.'
                // })
            })
    }

    onSourceMenuChange = (choice) => {
        this.setState({ sourcesMenu: choice })
    }

    render() {
        const { transactions } = this.props
        const { networth, categorySnapshots, sourcesMenu, recurringTransactions } = this.state
        const { total, checkings, savings, investment, credit, loans } = networth
        return (
            <div className='page' >
                <div className='dashboard-page'>
                    <div>
                        <div className='networth-container'>
                            <p className='dashboard-networth-title'>Net Worth</p>
                            <h3 className='page-title'>${total}</h3>
                            <p className='dashboard-networth-subtitle'>Net Worth Breakdown (down-arrow)</p>

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
                        <div className='categories-container'>
                            <div className='row-start'>
                                <p onClick={() => this.onSourceMenuChange(0)} className='dashboard-networth-title'>{sourcesMenu === 0 ? <strong>Spending</strong> : "Spending"}</p>
                                <p className='dashboard-networth-title'>&nbsp;/&nbsp;</p>
                                <p onClick={() => this.onSourceMenuChange(1)} className='dashboard-networth-title'>{sourcesMenu === 1 ? <strong>Income</strong> : "Income"}</p>
                            </div>
                            <h3 className='title'>{sourcesMenu === 0 ? "Spending" : "Income"} Sources</h3>
                            <CategoriesList categorySnapshots={categorySnapshots} sourcesMenu={sourcesMenu} />
                        </div>
                    </div>
                    <div className='recurring-container'>
                        <h3 className='title'>Recurring Transactions</h3>
                        <RecurringTransactionsList recurringTransactions={recurringTransactions} transactions={transactions} />
                    </div>
                </div>
            </div>
        )
    }
}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function CategoriesList({ categorySnapshots, sourcesMenu }) {

    let x = [];

    if (sourcesMenu === 0) {
        // Spending categories
        x = categorySnapshots.concat().sort((a, b) => {
            return (b.monthlyAverage) - (a.monthlyAverage);
        })
        x.sort((a, b) => {
            return (b.thisMonth) - (a.thisMonth);
        })
    } else {
        // Income categories
        x = categorySnapshots.concat().sort((a, b) => {
            return (a.monthlyAverage) - (b.monthlyAverage);
        })
        x.sort((a, b) => {
            return (a.thisMonth) - (b.thisMonth);
        })
    }

    x = x.slice(0, 10)
    x = x.filter((snapshot) => (
        Math.abs(snapshot.monthlyAverage) > 0
    ))

    return (
        <div className='categories-list'>
            <ul>
                {x.map((categorySnapshot) => {
                    const { categoryId, categoryName, categoryImg, snapshots, thisMonth, monthlyAverage } = categorySnapshot
                    return (
                        <li key={categoryId}>
                            <CategoryCard
                                categoryId={categoryId}
                                categoryName={categoryName}
                                categoryImg={categoryImg}
                                snapshots={snapshots}
                                thisMonth={thisMonth}
                                monthlyAverage={monthlyAverage}
                            />
                        </li>
                    )
                })}
            </ul>

        </div>
    )
}


function CategoryCard({ categoryId, categoryName, categoryImg, snapshots, thisMonth, monthlyAverage, categoryColor }) {
    return (
        <div className='category-card row-start'>
            <img className='category-img' src={require(`../images/categories/${categoryImg}`)} alt=''></img>

            <div className='category-info-div'>
                <h3 className='category-name'>{categoryName}</h3>
                <div className='row-start'>
                    <div className='month-div'>
                        <h3 className='label-text'>This month</h3>
                        <h3 className='amount-text'>{numberWithCommas(thisMonth.toFixed(2))}</h3>
                    </div>

                    <div>
                        <h3 className='label-text'>Monthly average</h3>
                        <h3 className='amount-text'>{numberWithCommas(monthlyAverage.toFixed(2))}</h3>
                    </div>
                    {/* <div>
                        <h3 className='label-text'>Total</h3>
                        <h3 className='amount-text'>{numberWithCommas(total.toFixed(2))}</h3>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

function RecurringTransactionsList({ recurringTransactions, transactions }) {

    recurringTransactions.sort((a, b) => a.recurringScore - b.recurringScore)

    return (
        <div className='categories-list'>
            <ul>
                {recurringTransactions.map((recurringTransaction) => {
                    const { id, category, categoryImg, name, recurringCount, recurringPlaidIds, recurringScore, isRecurring } = recurringTransaction
                    return (
                        <li key={id}>
                            <RecurringTransactionCard
                                id={id}
                                name={name}
                                recurringCount={recurringCount}
                                recurringScore={recurringScore}
                                recurringPlaidIds={recurringPlaidIds}
                                isRecurring={isRecurring}
                                categoryImg={categoryImg}
                                category={category}
                                transactions={transactions}
                            />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

class RecurringTransactionCard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            expanded: false,
        }
    }

    toggleExpand = () => {
        this.setState(({ expanded }) => {
            return { expanded: !expanded }
        })
    }

    render() {
        // id, recurringScore, isRecurring also are in this.props
        const { name, recurringCount, recurringPlaidIds, category, categoryImg, transactions } = this.props

        const recurringTransactions = recurringPlaidIds.map((plaidTransactionId) => (
            transactions.find((t) => t.plaidId === plaidTransactionId)
        ))

        console.log(recurringTransactions)

        return (
            <React.Fragment>
                <div className='transaction-card row' onClick={this.toggleExpand}>
                    <div className='row'>
                        <img className='transaction-category-img' src={require(`../images/categories/${categoryImg}`)} alt=''></img>
                        <div style={{ "maxWidth": "30vw" }}>
                            <div className='row transaction-category-div'>
                                <h3 id='category-text'>{category} ({recurringCount} Transactions)</h3>
                            </div>
                            <h3 id='name-text'>{name}</h3>
                        </div>
                    </div>
                </div>
                {this.state.expanded === true &&
                    <ul>
                        {recurringTransactions.map((transaction) => {
                            const { id, img, name, amount, date, pending, category, accountMask, instLogo, instColor, instName } = transaction
                            return (
                                <li key={id}>
                                    <TransactionsCard
                                        id={id}
                                        img={img}
                                        name={name}
                                        amount={amount}
                                        date={date}
                                        pending={pending}
                                        category={category}
                                        accountMask={accountMask}
                                        instLogo={instLogo}
                                        instColor={instColor}
                                        instName={instName}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                }
            </React.Fragment>
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