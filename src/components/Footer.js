import './Footer.css'
import ThemeSwitcher from "./ThemeSwitcher";

const Footer = (props) =>
{
    return (
        <footer>
            <p className='copyright-notice'>© 2022 Jonothan Hunt</p>
            <ThemeSwitcher
                theme={props.theme}
                setTheme={props.setTheme}
            />
        </footer>
    )

}

export default Footer