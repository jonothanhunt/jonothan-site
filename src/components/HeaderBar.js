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
                    <li className="header-link-list-item" ><a href="mailto:hello@jonothankh.com" className="header-link header-link-text">hello@jonothan.dev</a></li>
                    <li className="header-link-list-item" ><a href="https://github.com/jonothanhunt" className="header-link header-link-text">GitHub</a></li>
                    <li className="header-link header-link-icon"><a href="mailto:hello@jonothan.dev"><img className="header-icon" src={require('../icons/email.svg').default} alt="" /></a></li>
                    <li className="header-link header-link-icon"><a href="https://github.com/jonothanhunt"><img className="header-icon" src={require('../icons/github.svg').default} alt="" /></a></li>
                </ul>
            </nav>
        </header>
    )
}

export default HeaderBar;