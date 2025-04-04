import localFont from "next/font/local";

const lastik = localFont({
    src: "../fonts/Lastik.woff2",
    display: "swap",
});

const Card = (props) => {
    const slug = props.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return (
        <div
            id={slug}
            className="scroll-mt-56 min-w-3/4 sm:min-w-72 relative flex-1 p-[20px] rounded-lg bg-orange-100 transition-all outline-2 outline-transparent outline-offset-0  hover:outline-orange-100  hover:outline-offset-4"
        >
            <div className="mb-[20px] flex gap-4">
                {props.tags.length > 0 &&
                    props.tags.map((tag, index) => (
                        <div
                            key={"tag_" + index}
                            className="inline-block px-4 py-2 rounded-lg bg-fuchsia-700  text-orange-100 "
                        >
                            {tag}
                        </div>
                    ))}
            </div>

            <div className="w-full">
                {props.image.length > 0 && (
                    <img
                        alt={""}
                        className="w-full rounded-lg"
                        src={`/images/${props.image}`}
                    />
                )}
            </div>

            <h3 className={`text-4xl text-fuchsia-700 0 my-4 ${lastik.className}`}>{props.title}</h3>

            <p className="my-4 text-fuchsia-700 ">{props.description}</p>

            <div>
                {Object.keys(props.links).length > 0 &&
                    Object.keys(props.links).map((link, index) => (
                        <a
                            key={"link_" + index}
                            className={`text-fuchsia-700  inline-block mt-1 mr-4 mb-1 ml-0 py-2 px-0 font-bold underline underline-offset-4 decoration-1 hover:decoration-2  ${
                                index === 0
                                    ? "after:absolute after:top-0 after:right-0 after:bottom-0 after:left-0 after:content-[''] after:overflow-hidden"
                                    : "relative"
                            }`}
                            href={props.links[link]}
                        >
                            {link}
                        </a>
                    ))}
            </div>
        </div>
    );
};

export default Card;
