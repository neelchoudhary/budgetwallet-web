
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
                            img: null,
                            name: transaction.array[8],
                            amount: transaction.array[9],
                            date: transaction.array[10],
                            pending: transaction.array[11],
                            category: "Payroll",
                            mask: "0032",
                            logo: "iVBORw0KGgoAAAANSUhEUgAAAJgAAACYCAMAAAAvHNATAAAANlBMVEVHcEwOW6f///8IVqUPW6gQXKgRXKkPW6gTYKwPW6gbYqsxcbJ3ocza5vDs8/b0+Pmlwt1Vir96WNmQAAAACnRSTlMA////5HhLoCDGuAtrFAAABQNJREFUeNrt3H9vpCAQBuACIuC6wn7/L3vuXttb8UX5MdjJpVya3D9tngDiqDPz8dE67KiNcc4NgxDDsP7HGD3aj58cVhu3avAYnNE/wbOjSZredObauctCveGuWsAC1aet/6Ja7UTVcF1t1oiGYSxLVjdaO6sLjYZFT9OTIBuTpju2nCAdbmS2irTrOQ6iwxiaJ02LTqNtp9n07lJT7kjtNNtjGdUt3JfMMSvq5Uwvo3osMn+kZLXLaTDp9jyL7rJkBJGgGTKXeCw3teqKXH6VCTKZw/Pl/RM2y8KRnDNHcjk+t1YdTIZJUVycdsCX4rrlK2Fp2WBb11Hcnlu+FibvU/tq4nV8uaphXt5vrTJz4KqfMemTMtNyTny6GmBStsnwef99pLbA5JKSZdwDRnzH/j7qm2ByeSRkY9VBoaYgKWA+LTs9NNAFqUSQkmbG1t9PyFzNBguSDiZ9ItjQxRts42qHJWVj6QYLkhaWCtAOtpk5d5HAEjJTtJCxgQSWCNDG/CtyT6CB4QDNZV+RQEAEwzJ4ZdoJBazdYDBAm2zWzkcuOhgM0MD+t3kuQphHMns+YYlnRzoYDNDM6YS9Avy+MBig2bMJS7hoYUBmjifsK5DuDQNhkD2asLSLGuZ3MnMwYQcuahiYM5s+9NdA2l8G24WOOnWXVIfvcuhhcYDmEiv5HuBfA4vDIAtX8uXyJ7DHnXg88FoOyUAaw8REPjahLAwQg8yArSFL0b+/v5L8UYmA0aQD6RSs7zC7lVx3te8CU2dDgLW04A0FMWwKx2OO/qiNt1gnmLqdrUP0MWCMt1g32FJ2/Jv4sPg5mAwq3mRWsIDdp3iTaY4wHYVibGAmiizYwFx0o2QDe+5+wREmoliMD8xuQws+sHEb7vOB6e2DGx+Y4QtzPGHuF1YMG3jCBr4wwRMm+MJ+91gp7Pcc+29gv9FFKYxtoMg2tGb7MML28Y3vAy/bVwRsX6qwfQ3F9sUdk1edG9jA5+XwFmbi1+mKCWyMP0BkfO+7BGb3H98CB9gAvtRP890fjqUTbJn2H7m2eWPT7XjUfOLK+DLyPmMj/JAqSr6TkcHeM0OG/jU+2bDNBtHwY70iHxmwbe6FRekN6jETj+fH/RPY1uVwQsitrIAmK3XhBBZlhGicQnOSdtEBFmeq2FTSEbHsDBYnEpuDNK1wHczvknXtUWJbuG7GZnWcC7hN71HhKtiszrInzVY2XwML6jTf1J7kWHeBhdPcSZANOPvusH1as8lIacb5uZSwkJfSvLuVE8mSMJBsrfPS5svqTkthwOVyCw1IZBDmYQr4mFuaoRTBLR3PWGZqerKYhUAGYagK7qhmahT0MgSD1XljWcFUswzAoEuXlpg9AzRPCoNPgK6iKK8tQNvBYF3eeSXvKIhlMQzXC45VhZ+qJUCLYLhaUNeWyjYEaFsYdjUU8dbLtrC5wYVrzapDx3cYrmBsLRSf606Nd1irK1FoObfCoGsoa0YAa3mrArR/sADnq7SDCZYtDbDQuo5H12aF7AsG6xapWoSoCtknDNagVrnw+7zyYOMF87DdRXXvHtgep1D2Kn65IVdLtyN0cRbO2WvLT8Dl2vpD6TbZkuw/09zsCyynmkrec8IxEHT6svDqzH8zDK9GmrZt1Y3RUj1U6Do+Mm0lx7j5Ht92hYwbPDJuicm4iSjjtqucG9Vybu37vagMmyG/z12X9tF/APITr9CCbDsMAAAAAElFTkSuQmCC",
                            instColor: "#095aa6",
                            categoryId: transaction.array[4],
                            itemId: transaction.array[2],
                            accountId: transaction.array[3]
                        }
                    )
                })
                return transactions.slice(0,100)
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