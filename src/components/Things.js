import './Things.css'

const Things = (props) =>
{
    return (
        <div class="things-wrapper">
            {props.children}
        </div>
    )
}

export default Things;