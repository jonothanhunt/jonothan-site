// import './Projects.css'

import projects from '../../data/projects'
import Card from './Card'

function Projects()
{
    return (

        <div className="h-full p-5 mt-[20px] overflow-y-scroll rounded-3xl">
            <div style={{ height: 'Min(66vw, 60vh)' }} />
            <div className='mt-7 mb-7 flex flex-wrap gap-10'>

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

        </div>
    )
}

export default Projects