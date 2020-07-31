import React from 'react'
import { Bar, Line } from 'react-chartjs-2';
import { getInstitutionsAPI, getAccountsFromInstitutionIDAPI, getDailyAccountSnapshotsAPI, getMonthlyAccountSnapshotsAPI } from '../utils/api'
import Dropdown from 'react-bootstrap/Dropdown';


export default class HistoryPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            connectedInstitutions: [],
            filterAccountSelection: "None",
            filterAccountIdSelection: -1,
            lineChartData: {},
            barChartData: {},
            lineChartDataM: {},
            barChartDataM: {},
            totalLineChartDataM: {},
        }

        this.fetchConnectedAccounts = this.fetchConnectedAccounts.bind(this)
        this.updateInstitutionState = this.updateInstitutionState.bind(this)
        this.fetchDailySnapshots = this.fetchDailySnapshots.bind(this)
        this.fetchMonthlySnapshots = this.fetchMonthlySnapshots.bind(this)
        this.fetchTotalMonthlySnapshots = this.fetchTotalMonthlySnapshots.bind(this)
    }

    componentDidMount() {
        this.getChartData()
        this.fetchConnectedAccounts()
    }

    onSelectAccountFilter = (c) => {
        let accountChoice = JSON.parse(c)
        this.setState({ filterAccountIdSelection: accountChoice.id, filterAccountSelection: accountChoice.name })
        this.fetchDailySnapshots(accountChoice.id)
        this.fetchMonthlySnapshots(accountChoice.id)
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
                        this.fetchTotalMonthlySnapshots()
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
            const connectedInstitutions = state.connectedInstitutions.map((inst) => {
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


    fetchDailySnapshots(accountId) {
        getDailyAccountSnapshotsAPI(accountId)
            .then((fetchedDailySnapshots) => {
                this.setState(({ lineChartData, barChartData }) => {
                    const fetchedLabels = fetchedDailySnapshots.map((dailySnapshot) => (dailySnapshot.date))

                    const fetchedBalanceData = fetchedDailySnapshots.map((dailySnapshot) => (dailySnapshot.startBalance))

                    const fetchedCashOutData = fetchedDailySnapshots.map((dailySnapshot) => (dailySnapshot.cashOut))
                    const fetchedCashInData = fetchedDailySnapshots.map((dailySnapshot) => (dailySnapshot.cashIn))

                    lineChartData.labels = fetchedLabels.slice(0,30)
                    lineChartData.datasets[0].data = fetchedBalanceData.slice(0,30)
                    barChartData.labels = fetchedLabels.slice(0,30)
                    barChartData.datasets[0].data = fetchedCashOutData.slice(0,30)
                    barChartData.datasets[1].data = fetchedCashInData.slice(0,30)
                    return { lineChartData: lineChartData, barChartData: barChartData }
                })
            })
            .catch((error) => {
                console.warn("Error fetching transactions: " + error)
                // this.setState({
                //     error: 'There was an error fetching snapshot info.'
                // })
            })
    }

    fetchMonthlySnapshots(accountId) {
        getMonthlyAccountSnapshotsAPI(accountId)
            .then((fetchedMonthlySnapshots) => {
                this.setState(({ lineChartDataM, barChartDataM }) => {
                    const fetchedLabels = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.date))

                    const fetchedBalanceData = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.startBalance))

                    const fetchedCashOutData = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.cashOut))
                    const fetchedCashInData = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.cashIn))


                    lineChartDataM.labels = fetchedLabels
                    lineChartDataM.datasets[0].data = fetchedBalanceData
                    barChartDataM.labels = fetchedLabels
                    barChartDataM.datasets[0].data = fetchedCashOutData
                    barChartDataM.datasets[1].data = fetchedCashInData
                    return { lineChartDataM: lineChartDataM, barChartDataM: barChartDataM }
                })
            })
            .catch((error) => {
                console.warn("Error fetching transactions: " + error)
                // this.setState({
                //     error: 'There was an error fetching snapshot info.'
                // })
            })
    }

    fetchTotalMonthlySnapshots() {
        this.setState({
            totalLineChartDataM: {
                labels: [],
                datasets: [
                    {
                        label: 'Checkings',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    },
                    {
                        label: 'Savings',
                        data: [
                        ],
                        backgroundColor: 'rgba(39, 52, 105, 0.6)'
                    },
                    {
                        label: 'Credit',
                        data: [
                        ],
                        backgroundColor: 'rgba(200, 39, 73, 0.6)'
                    }
                ]
            }
        })
        this.state.connectedInstitutions.forEach((inst) => {
            inst.accounts.forEach((account) => {
                getDailyAccountSnapshotsAPI(account.id)
                    .then((fetchedMonthlySnapshots) => {
                        const fetchedLabels = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.date)).filter((e, i) => i % 15 === 0)
                        const fetchedBalanceData = fetchedMonthlySnapshots.map((monthlySnapshot) => (monthlySnapshot.startBalance)).filter((e, i) => i % 15 === 0)

                        let totalLineChartDataM = this.state.totalLineChartDataM

                        let t = 0
                        if (account.subtype === "checking") {
                            t = 0
                        } else if (account.subtype === "savings") {
                            t = 1
                        } else if (account.type === "credit") {
                            t = 2
                        }

                        let addedData;
                        if (totalLineChartDataM.datasets[t].data.length <= fetchedBalanceData.length) {
                            addedData = fetchedBalanceData.map((d, i) => (d ?? 0) + (totalLineChartDataM.datasets[t].data[i] ?? 0));
                            totalLineChartDataM.labels = fetchedLabels;
                        } else {
                            addedData = totalLineChartDataM.datasets[t].data.map((d, i) => (fetchedBalanceData[i] ?? 0) + (d ?? 0));
                        }
                        totalLineChartDataM.datasets[t].data = addedData
                        this.setState(
                            { totalLineChartDataM: totalLineChartDataM }
                        )
                        console.log(this.state.totalLineChartDataM)
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

    getChartData() {
        // Ajax calls here
        this.setState({
            lineChartData: {
                labels: [],
                datasets: [
                    {
                        label: 'Cash',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    }
                ]
            },
            barChartData: {
                labels: [],
                datasets: [
                    {
                        label: 'Cash Outflow',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    },
                    {
                        label: 'Cash Inflow',
                        data: [
                        ],
                        backgroundColor: 'rgba(39, 52, 105, 0.6)'
                    }
                ]
            },
            lineChartDataM: {
                labels: [],
                datasets: [
                    {
                        label: 'Cash',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    }
                ]
            },
            barChartDataM: {
                labels: [],
                datasets: [
                    {
                        label: 'Cash Outflow',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    },
                    {
                        label: 'Cash Inflow',
                        data: [
                        ],
                        backgroundColor: 'rgba(39, 52, 105, 0.6)'
                    }
                ],
            },
            totalLineChartDataM: {
                labels: [],
                datasets: [
                    {
                        label: 'Depository',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    },
                    {
                        label: 'Investment',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    },
                    {
                        label: 'Credit',
                        data: [
                        ],
                        backgroundColor: 'rgba(198, 173, 255, 0.6)'
                    }

                ],
            }
        });
    }

    render() {
        return (
            <div className='page'>
                <div className='history-page'>
                    <h3 className='page-title'>History</h3>
                    <div className="chart">
                        <Line
                            data={this.state.totalLineChartDataM}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Overall Balance History',
                                    fontSize: 25
                                },
                                legend: {
                                    display: true,
                                    position: 'bottom'
                                }
                            }}
                        />
                        <br />
                        <br />
                        <Dropdown onSelect={(c) => this.onSelectAccountFilter(c)}>
                            <Dropdown.Toggle id="dropdown-basic" className="dropdown-sort">
                                <div className='dropdown-sort-text-div'>
                                    <p className='dropdown-sort-text-desc'>Account: </p>
                                    <p className='dropdown-sort-text-main'>{this.state.filterAccountSelection}</p>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={JSON.stringify({ id: -1, name: "None" })}>{"None"}</Dropdown.Item>
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
                        <br></br>

                        <Bar
                            data={this.state.barChartDataM}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Monthly Cash Flow For ' + this.state.filterAccountSelection,
                                    fontSize: 25
                                },
                                legend: {
                                    display: false,
                                    position: 'bottom'
                                }
                            }}
                        />

                        <br />

                        <Line
                            data={this.state.lineChartDataM}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Monthly Balance Over Time for ' + this.state.filterAccountSelection,
                                    fontSize: 25
                                },
                                legend: {
                                    display: false,
                                    position: 'bottom'
                                }
                            }}
                        />

                        <br />
                        <br />

                        <Bar
                            data={this.state.barChartData}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Daily Cash Flow For ' + this.state.filterAccountSelection,
                                    fontSize: 25
                                },
                                legend: {
                                    display: false,
                                    position: 'bottom'
                                }
                            }}
                        />

                        <br />

                        <Line
                            data={this.state.lineChartData}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Daily Balance Over Time for ' + this.state.filterAccountSelection,
                                    fontSize: 25
                                },
                                legend: {
                                    display: false,
                                    position: 'bottom'
                                }
                            }}
                        />

                    </div>
                </div>
            </div>
        )
    }

}