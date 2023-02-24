import { useRef, useState, useEffect } from 'react';

import './App.css';
import HeaderBar from './components/HeaderBar';
import Introduction from './components/Introduction';
import PageWrapper from './components/PageWrapper';
import Thing from './components/Thing';
import Things from './components/Things';
import Footer from './components/Footer';

import things from './data/things'
import Experience from './components/Experience';


function App()
{
  const appRoot = useRef(null)

  const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark')

  return (
    <div ref={appRoot} className="App">

      {/* <HeaderThree /> */}
      <Experience
        appRoot={appRoot}
        theme={theme}
      />

      <HeaderBar
        theme={theme}
        setTheme={setTheme}
      />

      <PageWrapper>

        <div className="padding-element"></div>

        <Introduction />

        <Things>

          {things.map((thing, index) => (

            <Thing

              key={"thing_" + index}

              tags={thing.tags}
              image={thing.image}
              title={thing.title}
              description={thing.description}
              stack={thing.stack}
              links={thing.links}

            />

          ))}

        </Things>

        <Footer
          theme={theme}
          setTheme={setTheme}
        />

      </PageWrapper>

    </div>
  );
}

export default App;
