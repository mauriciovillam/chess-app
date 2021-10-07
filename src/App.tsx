import ChessboardGame from './Chessboard/ChessboardGame';
import './App.css';
import { Fragment, useEffect, useState } from 'react';
import Controls from './Chessboard/Controls';
import Game from './lib/game';

function App() {
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    setGame(new Game());
  }, []);

  return (
    <div className="App">
      {game && (
        <Fragment>
          <ChessboardGame game={game} />
          <Controls game={game} />
        </Fragment>
      )}
    </div>
  );
}

export default App;
