import { Move } from 'chess.js';
import Game from './game';

class MultiplayerClient
{
    client: WebSocket;

    listeners: Array<(data: any) => void>;

    constructor(game: Game) {
        const url = process.env.REACT_APP_WEBSOCKET_URL + '/ws/' + game.id;
        this.client = new WebSocket(url);
        this.listeners = [];

        const self = this;
        this.client.addEventListener('message', function (event) {
            const data = JSON.parse(event.data);
            if (!data || !data.move) {
                console.log('Received invalid move from WebSockets.');
                return;
            }

            self.receive(data.move);
        });
    }

    update(move: Move) {
        this.client.send(JSON.stringify({move}));
    }

    receive(event: MessageEvent) {
        this.listeners.forEach((listener) => listener(event));
    }

    onReceiveMove(listener: (data: any) => void) {
        this.listeners.push(listener);
    }
}

export default MultiplayerClient;