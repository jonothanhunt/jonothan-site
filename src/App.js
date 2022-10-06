import './App.css';
import HeaderBar from './components/HeaderBar';
import Introduction from './components/Introduction';
import PageWrapper from './components/PageWrapper';
import Thing from './components/Thing';
import Things from './components/Things';

import things from './things/things'

function App()
{

  return (
    <div className="App">
      <PageWrapper>
        <HeaderBar />

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
