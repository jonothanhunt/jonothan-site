const Card = (props) =>
{
    return (
        <div className="min-w-80 relative flex-1 p-[20px] rounded-xl bg-amber-400/60 dark:bg-yellow-700/40 transition-all outline outline-2 outline-transparent outline-offset-0  hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4">
            <div className="mb-[20px] flex gap-4">
                {props.tags.length > 0 && props.tags.map((tag, index) => (
                    <div key={"tag_" + index} className="inline-block px-4 py-2 rounded-lg bg-amber-200/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-amber-200">{tag}</div>
                ))}
            </div>

            <div className="w-full">
                {props.image.length > 0 && <img alt={""} className="w-full rounded-lg" src={`/images/${props.image}`} />}
            </div>

            <h3 className="text-xl text-zinc-800 dark:text-amber-200 my-4">{props.title}</h3>

            <p className="my-4 text-zinc-800 dark:text-amber-200">{props.description}</p>

            <div>
                {Object.keys(props.links).length > 0 && Object.keys(props.links).map((link, index) => (
                    <a key={"link_" + index} className={`text-zinc-800 dark:text-amber-200 inline-block mt-1 mr-4 mb-1 ml-0 py-2 px-0 font-bold underline underline-offset-4 decoration-1 hover:decoration-2  ${index === 0 ? "after:absolute after:top-0 after:right-0 after:bottom-0 after:left-0 after:content-[''] after:overflow-hidden" : "relative"}`} href={props.links[link]}>{link}</a>
                ))}
            </div>

        </div>
    )
}

export default Card;