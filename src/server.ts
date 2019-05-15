import { Server } from 'boardgame.io/server';
import { ShizuokaPokerGame } from './ShizuokaPoker';

const server = Server({ games: [ShizuokaPokerGame] });
server.run(8000);