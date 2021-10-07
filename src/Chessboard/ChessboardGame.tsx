import Chessboard from 'chessboardjsx';
import { Square } from 'chess.js'
import { Fragment, useEffect, useState } from 'react';
import Game from '../lib/game';

export default function ChessboardGame({ game }: { game: Game }) {
    const [boardPosition, setBoardPosition] = useState('start');
    const [orientation, setOrientation] = useState<'white' | 'black' | undefined>('white');

    const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: Square, targetSquare: Square }) => {
        // Don't allow to play other sides if this is a multiplayer game.
        if (game.session.turn() !== game.turn && game.mode !== 'LOCAL') {
            return null;
        }

        const move = game?.session.move({from: sourceSquare, to: targetSquare});
        if (move === null) {
            return;
        }
    };

    useEffect(() => {
        // Update the React board whenever there is a change in the headless board state.
        game.onBoardChange(() => {
            setOrientation(game.turn === 'w' ? 'white' : 'black');
            setBoardPosition(game.session.fen())
        });
    }, [game])

    return (
        <Fragment>
            <Chessboard position={boardPosition} onDrop={onDrop} orientation={orientation}/>
            {game.mode === 'MULTIPLAYER' && game.turn === game.session.turn() && (<strong>It's your turn!</strong>)}
        </Fragment>
    )
}