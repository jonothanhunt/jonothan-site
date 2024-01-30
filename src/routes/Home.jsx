import projects from '../data/projects'
import Card from '../components/home/Card.jsx'

function Home()
{
    return (

        <section className="max-w-screen-xl mx-auto h-full p-5 overflow-y-scroll rounded-3xl">
            <div className='mt-4 mb-7 flex flex-wrap gap-5'>

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
    )
}

export default Home