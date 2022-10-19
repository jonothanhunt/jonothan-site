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
            if (window.scrollY > (window.innerHeight / 3))
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
            <ul className="header-links">
                <li className="header-link header-link-text">Email</li>
                <li className="header-link header-link-text">LinkedIn</li>
                <li className="header-link header-link-icon"><img className="header-icon" src={require('../icons/email.svg').default} alt="" /></li>
                <li className="header-link header-link-icon"><img className="header-icon" src={require('../icons/linkedin.svg').default} alt="" /></li>
            </ul>
        </header>
    )
}

export default HeaderBar;