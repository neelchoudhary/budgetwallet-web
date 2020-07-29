
export function signInAPI(email, password) {
    let data = new URLSearchParams();
    data.append('email', email);
    data.append('password', password);
    return fetch("http://localhost:5000/api/auth/login", {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    })
        .then(res => res.json())
        .then((result) => {
            if (result.details) {
                throw new Error("Auth error")
            }
            return result
        },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.log(error)
                throw new Error("Auth error")
            }
        )
}

export function signOutAPI() {
    return fetch("http://localhost:5000/api/auth/logout", {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(res => res.json())
        .then(
            (result) => {
                return result
            },
            (error) => {
                console.log(error)
            }
        )
}


export function getInstitutionsAPI() {
    return fetch("http://localhost:5000/api/userfinances/getFinancialInstitutions", {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }

                const institutions = result.map((institution, index) => {
                    return (
                        {
                            id: institution.array[0],
                            name: institution.array[2],
                            color: institution.array[3],
                            logo: institution.array[4],
                            status: (institution.array[5]) ? "Error" : "Connected",
                            accounts: []
                        }
                    )
                })
                return institutions
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function getAccountsFromInstitutionIDAPI(institutionId) {
    return fetch(`http://localhost:5000/api/userfinances/getFinancialAccounts/${institutionId}`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(res => res.json())
        .then(
            (result) => {
                const accounts = result.map((account, index) => {
                    return (
                        {
                            id: account.array[0],
                            itemId: account.array[2],
                            name: account.array[7] ?? account.array[6],
                            balance: account.array[4] ?? 0,
                            availableBalance: account.array[5] ?? 0,
                            mask: account.array[10],
                            type: account.array[8],
                            subtype: account.array[9],
                            selected: (account.array[11]) ? true : false
                        }
                    )
                })
                return { institutionId: institutionId, accounts: accounts }
            },
            (error) => {
                console.log(error)
                throw new Error(error)
            }

        )
}

export function toggleAccountSelectionAPI(itemId, accountId, selected) {
    let data = new URLSearchParams()
    data.append('itemId', itemId)
    data.append('accountId', accountId)
    data.append('selected', selected)
    return fetch(`http://localhost:5000/api/userfinances/toggleFinancialAccount`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                } else if (result.details) {
                    throw new Error(result.details)
                }
                return
            },
            (error) => {
                console.log(error)
                throw new Error(error)
            }

        )
}

export function updateInstitutionAPI(itemId) {
    return fetch(`http://localhost:5000/api/plaidfinances/updateFinancialInstitution/${itemId}`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                } else if (result.details) {
                    throw new Error(result.details)
                }
                return
            },
            (error) => {
                console.log(error)
                throw new Error(error)
            }
        )
}

export function updateAccountsAPI(itemId) {
    return fetch(`http://localhost:5000/api/plaidfinances/updateFinancialAccounts/${itemId}`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                } else if (result.details) {
                    throw new Error(result.details)
                }
                return
            },
            (error) => {
                console.log(error)
                throw new Error(error)
            }
        )
}

const categoryImgMap =
{
    1: '001.svg',
    2: '002.svg',
    3: '003.svg',
    4: '004.svg',
    5: '005.svg',
    6: '006.svg',
    7: '007.svg',
    8: '008.svg',
    9: '009.svg',
    10: '010.svg',
    11: '011.svg',
    12: '012.svg',
    13: '013.svg',
    14: '014.svg',
    15: '015.svg',
    16: '016.svg',
    17: '017.svg',
    18: '018.svg',
    19: '019.svg',
    20: '020.svg',
    21: '021.svg',
    22: '022.svg',
    23: '023.svg',
    24: '024.svg',
    25: '025.svg',
    26: '026.svg',
    27: '027.svg',
    28: '028.svg',
    29: '029.svg',
    30: '030.svg',
    31: '031.svg',
    32: '032.svg',
    33: '033.svg',
    34: '034.svg',
    35: '035.svg',
    36: '036.svg',
    37: '037.svg',
    38: '038.svg',
    39: '039.svg',
    40: '040.svg',
    41: '041.svg',
    42: '042.svg',
    43: '043.svg',
    44: '044.svg',
    45: '045.svg',
    46: '046.svg',
    47: '047.svg',
    48: '048.svg',
    49: '049.svg',
    50: '050.svg',
    51: '051.svg',
    52: '052.svg',
    53: '053.svg',
    54: '054.svg',
    55: '055.svg',
    56: '056.svg',
    57: '057.svg'
}

export function getTransactionsAPI(itemId) {
    return fetch(`http://localhost:5000/api/userfinances/getFinancialTransactions/${itemId}`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }

                const transactions = result.map((transaction, index) => {
                    return (
                        {
                            id: transaction.array[0],
                            img: categoryImgMap[transaction.array[4]],
                            name: transaction.array[8],
                            amount: transaction.array[9],
                            date: transaction.array[10],
                            pending: transaction.array[11],
                            category: "",
                            mask: "",
                            logo: null,
                            instColor: "",
                            categoryId: transaction.array[4],
                            itemId: transaction.array[2],
                            accountId: transaction.array[3]
                        }
                    )
                })
                return transactions
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function getCategoriesAPI() {
    return fetch(`http://localhost:5000/api/financialcategories/getFinancialCategories`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }

                const categories = result.map((transaction, index) => {
                    return (
                        {
                            id: transaction.array[0],
                            category: transaction.array[1],
                            grouping: transaction.array[2]
                        }
                    )
                })
                return categories
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function getDailyAccountSnapshotsAPI(accountId) {
    return fetch(`http://localhost:5000/api/dataprocessing/getAccountDailySnapshots/${accountId}`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }

                const dailySnapshots = result.map((dailySnapshot) => {
                    return (
                        {
                            accountId: dailySnapshot.array[1],
                            date: dailySnapshot.array[2],
                            startBalance: dailySnapshot.array[3],
                            endBalance: dailySnapshot.array[4],
                            cashOut: dailySnapshot.array[5],
                            cashIn: dailySnapshot.array[6],
                        }
                    )
                })
                return dailySnapshots
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function getMonthlyAccountSnapshotsAPI(accountId) {
    return fetch(`http://localhost:5000/api/dataprocessing/getAccountMonthlySnapshots/${accountId}`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }

                const monthlySnapshots = result.map((monthlySnapshots) => {
                    return (
                        {
                            accountId: monthlySnapshots.array[1],
                            date: monthlySnapshots.array[2],
                            startBalance: monthlySnapshots.array[3],
                            endBalance: monthlySnapshots.array[4],
                            cashOut: monthlySnapshots.array[5],
                            cashIn: monthlySnapshots.array[6],
                        }
                    )
                })
                return monthlySnapshots
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function getLinkTokenAPI() {
    return fetch(`http://localhost:5000/api/plaidFinances/getLinkToken`, {
        credentials: 'include',
        method: 'get',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                }
                return result.linkToken
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function linkBankAccountAPI(publicToken, instId) {
    let data = new URLSearchParams()
    data.append('publicToken', publicToken)
    data.append('plaidInstitutionId', instId)
    return fetch(`http://localhost:5000/api/plaidFinances/linkFinancialInstitution`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                } else if (result.details) {
                    throw new Error(result.details)
                }
                return
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}

export function removeBankAccountAPI(itemId) {
    let data = new URLSearchParams()
    data.append('itemId', itemId)
    return fetch(`http://localhost:5000/api/plaidFinances/removeFinancialInstitution`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(res => {
            return res.json()
        })
        .then(
            (result) => {
                if (result.details && result.details.includes("token is expired")) {
                    throw new Error("Auth error")
                } else if (result.details) {
                    throw new Error(result.details)
                }
                return
            },
            // most likely a connection error
            (error) => {
                throw new Error(error)
            }
        )
}