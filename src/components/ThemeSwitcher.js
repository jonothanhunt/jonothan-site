import './ThemeSwitcher.css'

const ThemeSwitcher = (props) =>
{
    function changeTheme(e)
    {
        props.setTheme(e.target.checked ? 'dark' : 'light')
        localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
    }

    document.documentElement.setAttribute('data-theme', props.theme);

    return (
        <label className="switch">
            <input
                type="checkbox"
                aria-label="dark mode"
                defaultChecked={props.theme === 'dark'}
                onClick={(e) => { changeTheme(e) }}
            />
            <span className="slider round"></span>
        </label>
    )
}

export default ThemeSwitcher;