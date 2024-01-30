const Card = (props) =>
{
    return (
        <div className="min-w-[350px] relative flex-1 p-[20px] rounded-xl bg-white/40 transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-primary hover:outline-offset-4">
            <div className="mb-[20px] flex gap-4">
                {props.tags.length > 0 && props.tags.map((tag, index) => (
                    <div key={"tag_" + index} className="inline-block px-4 py-2 rounded-lg bg-white/20 text-primary">{tag}</div>
                ))}
            </div>

            <div className="w-full">
                {props.image.length > 0 && <img alt={""} className="w-full rounded-lg" src={`/images/${props.image}`} />}
            </div>

            <h3 className="text-xl text-primary my-4">{props.title}</h3>

            <p className="my-4 text-primary">{props.description}</p>

            <div>
                {Object.keys(props.links).length > 0 && Object.keys(props.links).map((link, index) => (
                    <a key={"link_" + index} className={`text-primary inline-block mt-1 mr-4 mb-1 ml-0 py-2 px-0 font-bold underline underline-offset-4 decoration-1 hover:decoration-2 decoration-primary  ${index === 0 ? "after:absolute after:top-0 after:right-0 after:bottom-0 after:left-0 after:content-[''] after:overflow-hidden" : "relative"}`} href={props.links[link]}>{link}</a>
                ))}
            </div>

        </div>
    )
}

export default Card;