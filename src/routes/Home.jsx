import './Home.css'

import { useRef } from "react"

import Experience from "../components/experience/Experience"
import Projects from "../components/home/Projects"
import HeaderBar from '../components/home/HeaderBar'
import Footer from '../components/home/Footer'

function Home(props)
{
    const appRoot = useRef(null)
    return (
        <div ref={appRoot} id="home">
            <HeaderBar />
            <Experience appRoot={appRoot} />
            <Projects />
            <Footer />
        </div>
    )
}

export default Home