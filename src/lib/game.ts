import chessApiClient, { ChessAPIClient, GameType } from './api';
import { ChessInstance, Move, ShortMove } from "chess.js";
import MultiplayerClient from "./multiplayer";

const Chess = require('chess.js');

class Game
{
    id?: string;

    api: ChessAPIClient;

    client: MultiplayerClient | null;

    session: ChessInstance;

    mode: GameType['mode'];

    listeners: Array<(move: Move | null) => void>;

    turn: 'b' | 'w';

    constructor() {
        this.session = this.createChessBoard();
        this.client = null;
        this.api = chessApiClient;
        this.listeners = [];
        this.mode = 'LOCAL';
        this.turn = 'w';
    }

    start(mode: GameType['mode']) {
        return new Promise((resolve, reject) => {
            this.api.createGame({ mode }).then((resp) => {
                this.id = resp.id;
                this.mode = mode;

                if (mode === 'MULTIPLAYER') {
                    this.client = this.createMultiplayerClient();
                }
                
                this.session = this.createChessBoard();
                this.triggerBoardChange(null);
                resolve(this);
            }).catch((error) => reject(error));
        });
    }

    join(id: GameType['id']) {
        return new Promise((resolve, reject) => {
            this.api.getGame(id).then((resp) => {
                this.id = resp.id;
                this.turn = resp.mode === 'LOCAL' ? 'w' : 'b';
                this.mode = resp.mode;

                if (resp.mode === 'MULTIPLAYER') {
                    this.client = this.createMultiplayerClient();
                }

                this.session = this.createChessBoard(resp.pgn);
                this.triggerBoardChange(null);
                resolve(this);
            }).catch((error) => reject(error));
        });
    }

    save() {
        if (this.mode !== 'LOCAL' || !this.id) {
            return;
        }

        return this.api.saveGame(this.id, { pgn: this.session.pgn() })
    }

    createChessBoard(pgn?: string): ChessInstance {
        const chess: ChessInstance = new Chess();

        if (pgn) {
            const valid = chess.load_pgn(pgn);
            if (!valid) {
                throw new Error('Trying to create a chess board with invalid PGN.')
            }
        }

        // Add a proxy to the move/load method of the Chess board, so we can trigger board changes when necessary.
        chess.move = new Proxy(chess.move, {
            apply: (target, thisArg, args) => {
                const move = target(...(args as [string | ShortMove, { sloppy: boolean | undefined }]));
                if (move) {
                    this.triggerBoardChange(args[0]);
                }

                return move;
            }
        });
        
        return chess;
    }

    createMultiplayerClient() {
        const client = new MultiplayerClient(this);

        // Add an event listener for when the MultiplayerClient receives a socket, and update the board accordingly.
        client.onReceiveMove((move) => {
            this.session.move(move);

            console.log(this.session.turn(), this.turn);
            if (this.session.turn() === this.turn) {
                this.triggerBoardChange(move);
            }
        });

        this.onBoardChange((move) => {
            if (this.session.turn() !== this.turn && move) {
                client.update(move);
            }
        });

        return client;
    }

    onBoardChange(handler: (move: Move | null) => void) {
        this.listeners.push(handler);
    }

    triggerBoardChange(move: Move | null) {
        this.listeners.forEach((listener) => listener(move));
    }
}

export default Game;
