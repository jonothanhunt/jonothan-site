import { useRef } from 'react';

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

  return (
    <div ref={appRoot} className="App">

      {/* <HeaderThree /> */}
      <Experience
        appRoot={appRoot} />

      <HeaderBar />

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

        <Footer />

      </PageWrapper>

    </div>
  );
}

export default App;
