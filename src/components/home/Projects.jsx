import './Projects.css'

import projects from '../../data/projects'
import Card from './Card'

function Projects()
{
    return (

        <div className="projects-wrapper">
            <div style={{ height: 'Min(66vw, 60vh)' }} />
            <div className='project-cards-wrapper'>

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