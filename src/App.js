import './App.css';
import HeaderBar from './components/HeaderBar';
import Introduction from './components/Introduction';
import HeaderThree from './components/HeaderThree';
import PageWrapper from './components/PageWrapper';
import Thing from './components/Thing';
import Things from './components/Things';

import things from './data/things'

function App()
{

  return (
    <div className="App">

      <HeaderThree />

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

      </PageWrapper>

    </div>
  );
}

export default App;
