import { Client } from 'boardgame.io/react';
import { Game, TurnOrder, PlayerView } from 'boardgame.io/core';
import _ from 'lodash';
import assert from 'power-assert';

// 山札 deck
// 場札 board
// 手札 hand

const CARD_NUMS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const CARD_SUITS = ['s', 'd', 'h', 'c'];

const ShizuokaPoker = Game({
  name: 'shizuoka-poker',
  setup: () => {
    const allCards = [];
    CARD_NUMS.forEach(n => {
      CARD_SUITS.forEach(s => {
        allCards.push(`${n}${s}`);
      });
    });
    const deck = _.shuffle(allCards);
    const board = [];
    const p0Hand = [];
    const p1Hand = [];
    _.times(5, () => board.push(deck.pop()));
    _.times(5, () => p0Hand.push(deck.pop()));
    _.times(5, () => p1Hand.push(deck.pop()));


    return {
      secret: {
        deck,
      },
      board,
      trash: [],
      publicHands: {
        '0': [],
        '1': [],
      },
      players: {
        '0': {
          hand: p0Hand,
        },
        '1': {
          hand: p1Hand,
        },
      },
    };
  },

  moves: {
    change: (G, ctx, myHandCard, boardCard) => {
      const secretHand = G.players[ctx.currentPlayer].hand;
      const publicHand = G.publicHands[ctx.currentPlayer];
      const srcHand = secretHand.includes(myHandCard) ? secretHand :
        publicHand.includes(myHandCard) ? publicHand : assert(false);

      const board = G.board;
      assert(board.includes(boardCard));

      moveCard(srcHand, myHandCard, board);
      moveCard(board, boardCard, publicHand);

      return _.cloneDeep(G);
    },
    throwAndChange: (G, ctx, myHandCard, boardCard) => {
      const secretHand = G.players[ctx.currentPlayer].hand;
      const publicHand = G.publicHands[ctx.currentPlayer];
      const srcHand = secretHand.includes(myHandCard) ? secretHand :
        publicHand.includes(myHandCard) ? publicHand : assert(false);

      const board = G.board;
      assert(board.includes(boardCard));

      const deck = G.secret.deck;

      moveCard(srcHand, myHandCard, board);
      moveCard(board, boardCard, G.trash);
      moveCard(deck, deck[0], secretHand);

      return _.cloneDeep(G);
    },
    skip: (G) => G,
    stop: (G) => Object.assign({}, G, { stopped: true }),
  },
  flow: {
    turnOrder: TurnOrder.DEFAULT,
    endTurnIf: () => true,
    phases: [
      {
        name: 'change',
        allowedMoves: ['change', 'throwAndChange', 'skip'],
        endPhaseIf: (G, ctx) => ctx.turn === 6,
      },
      {
        name: 'stoppableChange',
        allowedMoves: ['change', 'throwAndChange', 'skip', 'stop'],
        endPhaseIf: (G) => G.stopped,
      },
      {
        name: 'lastChange',
        allowedMoves: ['change', 'throwAndChange', 'skip'],
        endPhaseIf: () => true,
      },
    ],
  }
});

function moveCard(src, card, dest) {
  const i = src.indexOf(card);
  assert(i !== -1);
  _.pullAt(src, i);
  dest.push(card);
}

const App = Client({
  game: ShizuokaPoker,
  //multiplayer: true,
});

export default App;
