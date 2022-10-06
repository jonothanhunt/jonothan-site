import './PageWrapper.css'

const PageWrapper = (props) =>
{
    return (
        <div className="wrapper">
            {props.children}
        </div>
    )
}

export default PageWrapper;