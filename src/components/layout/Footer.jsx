const Footer = (props) =>
{
    const date = new Date();
    const year = date.getFullYear();

    return (
        <footer className='text-center relative pb-[20px]'>
            <p className='text-primary'>© {year} Jonothan Hunt</p>
            <p className='text-primary'><a className='underline' href='https://github.com/jonothanhunt/jonothan-site'>Source code on GitHub</a></p>
        </footer>
    )

}

export default Footer