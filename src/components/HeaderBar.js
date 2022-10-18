import { useEffect, useRef, useState } from "react";
import './HeaderBar.css'

const HeaderBar = (props) =>
{
    const [titleVisible, setTitleVisibility] = useState(false);

    useEffect(() =>
    {

        window.addEventListener('scroll', (event) =>
        {
            if (window.scrollY > (window.innerHeight / 3))
            {
                setTitleVisibility(true)
            }
            else
            {
                setTitleVisibility(false)
            }
        });




        // return () => cleanupObject.removeChild(renderer.domElement);

    }, []);

    return (
        <header className={titleVisible ? "header active" : "header"}>
            <h1 className={titleVisible ? "name active" : "name"}>Jonothan</h1>
            <ul className="header-links">
                <li className="header-link">Email</li>
                <li className="header-link">LinkedIn</li>
            </ul>
        </header>
    )
}

export default HeaderBar;