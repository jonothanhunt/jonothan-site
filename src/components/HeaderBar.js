import './HeaderBar.css'

const HeaderBar = (props) =>
{
    return (
        <header className="header">
            <h1 className="name">Jonothan</h1>
            <ul className="header-links">
                <li className="header-link">Email</li>
                <li className="header-link">LinkedIn</li>
            </ul>
        </header>
    )
}

export default HeaderBar;