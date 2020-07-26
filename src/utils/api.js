
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
        .then(
            (result) => {
                return result
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.log(error)
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
                            name: account.array[6],
                            balance: account.array[4] ?? 0,
                            mask: account.array[10],
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