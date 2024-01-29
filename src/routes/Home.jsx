import { useRef } from "react"

import Experience from "../components/experience/Experience"
import Projects from "../components/home/Projects"
import Header from '../components/home/Header'
import Footer from '../components/home/Footer'

function Home(props)
{
    const appRoot = useRef(null)
    return (
        <div ref={appRoot} id="home">
            <Header />
            <Experience appRoot={appRoot} />
            <Projects />
            <Footer />
        </div>
    )
}

export default Home