import Image from "next/image";
import Link from "next/link";
import projects from "./data/projects";
import Card from "./components/Card.jsx";

export default function Home() {
    return (
    <section className="max-w-screen-xl mx-auto h-full p-5 rounded-3xl">
            <div className="h-[min(70vw,60vh)]" />
            <div className="h-[240px] relative mt-4 w-full min-w-80 rounded-xl overflow-hidden bg-amber-400/60 dark:bg-amber-900/60 flex p-6">
                <img
                    src="./images/effects.jpeg"
                    className="absolute top-0 left-0 w-2/3 h-full gradient-mask-r-50 object-cover opacity-80"
                />
                <div className="ml-auto my-auto z-10 text-right flex flex-col gap-4">
                    <p className="w-fit ml-auto text-amber-200  text-md font-bold bg-yellow-900 dark:bg-zinc-800 rounded-md px-3 py-1">
                        New!
                    </p>
                    <p className="text-zinc-800 dark:text-amber-200 text-xl max-w-50">
                        Let's make an effect!
                    </p>
                    <Link
                        href={"/make"}
                        className="block ml-auto text-zinc-800 px-5 w-fit py-2 rounded-lg bg-amber-200 transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4  focus-visible:outline-zinc-800 dark:focus-visible:outline-amber-200 focus-visible:outline-offset-4"
                    >
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
                        // stack={project.stack}
                        links={project.links}
                    />
                ))}
            </div>
        </section>
    );
}
