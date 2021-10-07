import React, { useEffect, useState } from "react";
import Game from "../lib/game";

export default function Controls({ game }: { game: Game }) {
    const [gameId, setGameId] = useState<string | undefined>(game?.id);
    const [codeInput, setCodeInput] = useState<string>('');

    const createMultiplayerGame = () => {
        game.start('MULTIPLAYER')
            .then(() => setGameId(game.id))
            .catch((err) => console.log('Failed to create game.'));
    };

    const startLocalGame = () => {
        game.start('LOCAL')
            .then(() => setGameId(game.id));
    }

    const joinGame = () => {
        game.join(codeInput)
            .then(() => setGameId(game.id))
            .catch((err) => console.log('Failed to join.'));
    };

    const saveLocalGame = () => {
        game.save()?.then(() => alert('The game has been successfully saved.'));
    };

    useEffect(() => startLocalGame(), []);

    return (
        <div className="controls">
            {game.mode !== 'MULTIPLAYER' ? (
                <React.Fragment>
                    <div>
                        <button type="button" onClick={createMultiplayerGame}>Start New Multiplayer Game</button>
                        <button type="button" onClick={startLocalGame}>Start New Local Game</button>
                        <button type="button" onClick={saveLocalGame}>Save Local Game</button>
                    </div>

                    {gameId && <p>Your local game ID is <strong>{gameId}</strong>.<br/> save it somewhere safe so you can come back to it later if you close this window.</p>}
                        
                    <div>
                        <input value={codeInput} onChange={(event) => setCodeInput(event.target.value)} placeholder="Write the code here..." />
                        <button type="button" onClick={joinGame}>Join Multiplayer/Local Game with Code</button>
                    </div>
                </React.Fragment>
            ) : game.turn === 'w' 
                    ? <p>Invite a friend using this code: <strong>{gameId}</strong></p> 
                    : <p>You are playing as blacks in the game <strong>{gameId}</strong></p>
            }
        </div>
    )
}