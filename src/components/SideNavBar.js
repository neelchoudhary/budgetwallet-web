import React from 'react'
import { NavLink } from 'react-router-dom'


export default class SideNavBar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected: [0, 0, 0, 0, 0, 0]
        }
    }

    test = (i) => {
        this.setState(({ selected }) => {
            selected = selected.map((item, index) => {
                if (index === i) {
                    return 1;
                } else {
                    return 0;
                }
            })
            return { selected: selected }
        })
    }

    render() {
        const selectedStyle = {
            fontWeight: 700,
            backgroundColor: "rgba(169,133,255,0.8)"
        };

        const unSelectedStyle = {
            fontWeight: "inherit",
            backgroundColor: "inherit"
        };

        const { selected } = this.state

        return (
            <div className='side-nav-bar'>
                <h1 className='nav-app-title'>BudgetWallet</h1>
                <hr className='nav-line' />
                <ul className='nav-ul'>

                    <li style={selected[0] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/dashboard' exact className='nav-link' onClick={() => this.test(0)}>Home</NavLink>
                    </li>
                    <li style={selected[1] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/analysis' exact className='nav-link' onClick={() => this.test(1)}>Analysis</NavLink>
                    </li>
                    <li style={selected[2] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/budget' exact className='nav-link' onClick={() => this.test(2)}>Budget</NavLink>
                    </li>
                    <li style={selected[3] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/history' exact className='nav-link' onClick={() => this.test(3)}>History</NavLink>
                    </li>
                    <li style={selected[4] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/transactions' exact className='nav-link' onClick={() => this.test(4)}>Transactions</NavLink>
                    </li>
                    <li style={selected[5] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/accounts' exact className='nav-link' onClick={() => this.test(5)}>Accounts</NavLink>
                    </li>
                    <li style={selected[6] ? selectedStyle : unSelectedStyle}>
                        <NavLink to='/logout' exact className='nav-link' onClick={() => this.test(6)}>Log Out</NavLink>
                    </li>
                </ul>
            </div>
        )
    }

}