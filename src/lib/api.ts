export type GameType = {
    id: string;
    pgn: string;
    mode: 'MULTIPLAYER' | 'LOCAL';
}

export class ChessAPIClient
{
    createGame(data: { mode: GameType['mode'] }) {
        return this.fetch<GameType>('POST', '/game', data);
    }

    getGame(id: GameType['id']) {
        return this.fetch<GameType>('GET', `/game/${id}`);
    }

    saveGame(id: GameType['id'], data: { pgn: GameType['pgn'] }) {
        return this.fetch<GameType>('POST', `/game/${id}`, data);
    }

    fetch<T>(method: string, route: string, data?: object) {
        const url = process.env.REACT_APP_API_URL + '/v1' + route;

        return new Promise<T>((resolve, reject) => {
            fetch(url, {
                method: method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then((resp) => resp.json())
            .then((resp: T) => resolve(resp))
            .catch((err) => reject(err));
        })
    }
}

const chessApiClient = new ChessAPIClient();

export default chessApiClient;
