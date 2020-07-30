import React from 'react'
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getTransactionsAPI, getCategoriesAPI } from '../utils/api'
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import Pagination from 'react-bootstrap/Pagination';
import Badge from 'react-bootstrap/Badge';


export default class TransactionsPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transactions: [],
            connectedInstitutions: [],
            categories: [],
            sortBy: this.sortByChoices()[0],
            filterAccountSelection: "All Accounts",
            filterAccountIdSelection: -1,
            filterCategorySelection: "All Categories",
            filterCategoryIdSelection: -1,
            filterCategorySearchValue: "",
            transactionSearchValue: "",
            paginationValue: 1
        }

        this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
        this.updateInstitutionState = this.updateInstitutionState.bind(this)
        this.fetchCategories = this.fetchCategories.bind(this)
        this.fetchTransactions = this.fetchTransactions.bind(this)
    }

    sortByChoices = () => {
        return ["Most Recent", "Amount Asc", "Amount Desc"]
    }

    onSelectSort = (choice) => {
        this.resetPagination()
        this.setState({ sortBy: choice })
    }

    onSelectAccountFilter = (c) => {
        this.resetPagination()
        let accountChoice = JSON.parse(c)
        this.setState({ filterAccountIdSelection: accountChoice.id, filterAccountSelection: accountChoice.name })
    }

    onSelectCategoryFilter = (c) => {
        this.resetPagination()
        let categoryChoice = JSON.parse(c)
        this.setState({ filterCategoryIdSelection: categoryChoice.id, filterCategorySelection: categoryChoice.name })
    }

    onChangeCategorySearch = (value) => {
        this.setState({ filterCategorySearchValue: value })
    }

    onSearchTransactions = (value) => {
        this.resetPagination()
        this.setState({ transactionSearchValue: value })
    }

    onSetPagination = (value) => {
        this.setState({ paginationValue: value })
    }

    onPaginationNext = () => {
        this.setState(({ paginationValue }) => {
            return { paginationValue: paginationValue + 1 }
        })
    }

    onPaginationPrev = () => {
        this.setState(({ paginationValue }) => {
            return { paginationValue: Math.max(paginationValue - 1, 0) }
        })
    }

    resetPagination = () => {
        this.onSetPagination(1)
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
        return (
            <div className='page'>
                <div className='transactions-page'>
                    <h3 className='page-title'>Transactions</h3>
                    <div className='transactions-sort-div'>
                        <Dropdown onSelect={(c) => this.onSelectSort(c)}>
                            <Dropdown.Toggle id="dropdown-basic" className="dropdown-sort">
                                <div className='dropdown-sort-text-div'>
                                    <p className='dropdown-sort-text-desc'>Sort By: </p>
                                    <p className='dropdown-sort-text-main'>{this.state.sortBy}</p>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {this.sortByChoices().map((choice) => (
                                    <Dropdown.Item eventKey={choice}>{choice}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown onSelect={(c) => this.onSelectAccountFilter(c)}>
                            <Dropdown.Toggle id="dropdown-basic" className="dropdown-sort">
                                <div className='dropdown-sort-text-div'>
                                    <p className='dropdown-sort-text-desc'>Account: </p>
                                    <p className='dropdown-sort-text-main'>{this.state.filterAccountSelection}</p>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={JSON.stringify({ id: -1, name: "All Accounts" })}>{"All Accounts"}</Dropdown.Item>
                                {this.state.connectedInstitutions.map((inst) => (
                                    <React.Fragment>
                                        <Dropdown.Header>{inst.name}</Dropdown.Header>
                                        {inst.accounts.map((account) => {
                                            return <Dropdown.Item eventKey={JSON.stringify({ id: account.id, name: `${account.name} ****${account.mask}` })}>{`${account.name} ****${account.mask}`}</Dropdown.Item>
                                        })}
                                    </React.Fragment>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown onSelect={(c) => this.onSelectCategoryFilter(c)}>
                            <Dropdown.Toggle id="dropdown-basic" className="dropdown-sort">
                                <div className='dropdown-sort-text-div'>
                                    <p className='dropdown-sort-text-desc'>Category: </p>
                                    <p className='dropdown-sort-text-main'>{this.state.filterCategorySelection}</p>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <FormControl
                                    autoFocus
                                    className="mx-3 my-2 w-auto"
                                    placeholder="Type to filter..."
                                    onChange={(e) => this.onChangeCategorySearch(e.target.value)}
                                    value={this.state.filterCategorySearchValue}
                                />
                                <Dropdown.Item eventKey={JSON.stringify({ id: -1, name: "All Categories" })}>{"All Categories"}</Dropdown.Item>
                                {this.state.categories.filter((category) => category.category.toLowerCase().includes(this.state.filterCategorySearchValue.toLowerCase())).map((category) => {
                                    return <Dropdown.Item eventKey={JSON.stringify({ id: category.id, name: category.category })}>{category.category}</Dropdown.Item>
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    <div className='transactions-search-div'>
                        <FormControl
                            placeholder="Type to search..."
                            aria-label="Search Transactions"
                            onChange={(e) => this.onSearchTransactions(e.target.value)}
                            value={this.state.transactionSearchValue}
                        />
                    </div>

                    <TransactionsList
                        transactions={this.state.transactions}
                        sortBy={this.state.sortBy}
                        sortByChoices={this.sortByChoices()}
                        filterAccountIdSelection={this.state.filterAccountIdSelection}
                        filterCategoryIdSelection={this.state.filterCategoryIdSelection}
                        transactionSearchValue={this.state.transactionSearchValue}
                        currentPage={this.state.paginationValue}
                        onSetPagination={this.onSetPagination}
                    />
                    {/* <div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/good-ware" title="Good Ware">Good Ware</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/becris" title="Becris">Becris</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/monkik" title="monkik">monkik</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/itim2101" title="itim2101">itim2101</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/srip" title="srip">srip</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/dmitri13" title="dmitri13">dmitri13</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">Eucalyp</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/surang" title="surang">surang</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/wanicon" title="wanicon">wanicon</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/xnimrodx" title="xnimrodx">xnimrodx</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/ultimatearm" title="ultimatearm">ultimatearm</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/fjstudio" title="fjstudio">fjstudio</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/iconixar" title="iconixar">iconixar</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/smalllikeart" title="smalllikeart">smalllikeart</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div> */}
                </div>
            </div>
        )
    }
}

function TransactionsList({ transactions, sortBy, sortByChoices, filterAccountIdSelection, filterCategoryIdSelection, transactionSearchValue, currentPage, onSetPagination }) {
    if (sortBy === sortByChoices[0]) {
        transactions.sort((t1, t2) => t2.date.localeCompare(t1.date))
    } else if (sortBy === sortByChoices[1]) {
        transactions.sort((t1, t2) => t2.amount - t1.amount)
    } else if (sortBy === sortByChoices[2]) {
        transactions.sort((t1, t2) => t1.amount - t2.amount)
    } else {
        transactions.sort((t1, t2) => t2.date.localeCompare(t1.date))
    }

    if (filterAccountIdSelection !== -1) {
        transactions = transactions.filter((t) => t.accountId == filterAccountIdSelection)
    }

    if (filterCategoryIdSelection !== -1) {
        transactions = transactions.filter((t) => t.categoryId == filterCategoryIdSelection)
    }

    if (transactionSearchValue != "") {
        transactions = transactions.filter((t) => t.name.toLowerCase().includes(transactionSearchValue.toLowerCase()) || t.category.toLowerCase().includes(transactionSearchValue.toLowerCase()))
    }

    const numTransactions = transactions.length

    // Transactions per page
    const pageLimit = 20
    const pages = Math.ceil(numTransactions / pageLimit)

    const ellipseLimit = 2;
    const pagesUpper = Math.min(currentPage + ellipseLimit, pages)
    const pagesLower = Math.max(currentPage - ellipseLimit, 1)

    let pagesArray = []

    if (pagesLower !== 1) {
        pagesArray.push(1)
        pagesArray.push(-1)
    }

    for (let i = pagesLower; i <= pagesUpper; i++) {
        pagesArray.push(i)
    }

    if (pagesUpper !== pages) {
        pagesArray.push(-1)
        pagesArray.push(pages)
    }

    const totalValue = transactions.reduce((sum, t) => (t.amount + sum), 0)
    const start = Math.max((currentPage - 1) * pageLimit, 0)
    const end = Math.min(start + pageLimit, numTransactions)
    transactions = transactions.slice(start, end)

    return (
        <div className='transactions-list'>
            <div className='row'>
                <p>Viewing {pages === 0 ? 0 : start + 1}-{end} of {numTransactions} Transactions</p>
                <p>Cumulative Value: ${totalValue.toFixed(2)}</p>
                <div className='transactions-pagination'>
                    <Pagination>
                        {/* <Pagination.First onClick={() => onSetPagination(1)} /> */}
                        <Pagination.Prev onClick={() => onSetPagination(Math.max(currentPage - 1, 1))} />
                        {pagesArray.map((e, index) => {
                            if (e === -1) {
                                return <Pagination.Ellipsis />
                            } else {
                                return <Pagination.Item active={e === currentPage} onClick={() => onSetPagination(e)}>{e}</Pagination.Item>
                            }
                        })}
                        <Pagination.Next onClick={() => onSetPagination(Math.min(currentPage + 1, pages))} />
                        {/* <Pagination.Last onClick={() => onSetPagination(pages)} /> */}
                    </Pagination>
                </div>
            </div>

            <ul>
                {transactions.map((transaction) => {
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

        </div>
    )
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