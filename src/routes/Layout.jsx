// import { useRef } from "react"
import { useLayoutEffect, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import { useState } from "react";

import Experience from "../components/experience/Experience"
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

function Layout({appRoot})
{
    const location = useLocation();
    const locationIsHome = ["/"].includes(location.pathname);

    const [titleVisible, setTitleVisibility] = useState(false);

    useLayoutEffect(() => {
        const onScroll = () => {
            if(locationIsHome) {
                setTitleVisibility(
                    window.scrollY > window.innerHeight / 2.7 
                );
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if(!locationIsHome) {
            setTitleVisibility(true)
        }
    }, [locationIsHome])
    
    return (
        <div id="home">
            <Header titleVisible={titleVisible} />
            <Experience textVisible={locationIsHome} appRoot={appRoot} />
                <Outlet />
            <Footer />
        </div>
    )
}

export default Layout