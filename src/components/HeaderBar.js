import { useEffect, useRef, useState } from "react";
import './HeaderBar.css'

const HeaderBar = (props) =>
{
    const [titleVisible, setTitleVisibility] = useState(false);

    useEffect(() =>
    {
        let alreadyVisible = false;

        window.addEventListener('scroll', (event) =>
        {
            if (window.scrollY > (window.innerHeight / 2.7))
            {
                if (!alreadyVisible)
                {
                    setTitleVisibility(true)
                    alreadyVisible = true
                }
            }
            else
            {
                if (alreadyVisible)
                {
                    setTitleVisibility(false)
                    alreadyVisible = false
                }
            }
        });




        // return () => cleanupObject.removeChild(renderer.domElement);

    }, []);

    return (
        <header className={titleVisible ? "header active" : "header"}>
            <h1 className={titleVisible ? "name active" : "name"}>Jonothan</h1>
            <nav>
                <ul className="header-links">
                    <li className="header-link-list-item" ><a href="mailto:hello@jonothankh.com" className="header-link header-link-text">Email</a></li>
                    <li className="header-link-list-item" ><a href="https://www.linkedin.com/in/jonothankh/" className="header-link header-link-text">LinkedIn</a></li>
                    <li className="header-link header-link-icon"><img className="header-icon" src={require('../icons/email.svg').default} alt="" /></li>
                    <li className="header-link header-link-icon"><img className="header-icon" src={require('../icons/linkedin.svg').default} alt="" /></li>
                </ul>
            </nav>
        </header>
    )
}

export default HeaderBar;