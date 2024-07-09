import projects from "../data/projects";
import Card from "../components/home/Card.jsx";
import { Link } from "react-router-dom";

function Home() {
    return (
        
        <section className="max-w-screen-xl mx-auto h-full p-5 overflow-y-scroll rounded-3xl">
            <div className="h-[400px]"/>
            <div className="h-[240px] relative mt-4 w-full min-w-80 rounded-xl overflow-hidden bg-primary/50 flex p-6">
                <img
                    src="./images/effects.jpeg"
                    className="absolute top-0 left-0 w-2/3 h-full gradient-mask-r-50 object-cover opacity-50"
                />
                <div className="ml-auto my-auto z-10 text-right flex flex-col gap-4">
                    <p className="w-fit ml-auto text-white text-md font-bold bg-primary/60 rounded-md px-3 py-1">
                        New!
                    </p>
                    <p className="text-white text-xl max-w-50">
                        Let's make an effect!
                    </p>
                    <Link to={'/make'} className="block ml-auto text-primary px-5 w-fit py-2 rounded-lg bg-white/80 transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-white hover:outline-offset-4  focus-visible:outline-white focus-visible:outline-offset-4">
                        Go to AR Effects
                    </Link>
                </div>
            </div>
            
            <div className="mt-4 mb-7 flex flex-wrap gap-5">
                {projects.map((project, index) => (
                    <Card
                        key={"project_" + index}
                        tags={project.tags}
                        image={project.image}
                        title={project.title}
                        description={project.description}
                        stack={project.stack}
                        links={project.links}
                    />
                ))}
            </div>
        </section>
    );
}

export default Home;
