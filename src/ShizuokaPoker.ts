import _ from 'lodash'
import { Game, PlayerView, IGameCtx } from 'boardgame.io/core';
import { AI, IAIMoveObj } from 'boardgame.io/ai'
import assert from 'power-assert';

export type ICard = string;

type ISecretState = { deck: ICard[] };
type IPlayerState = { hand: ICard[] };

export type GameState = {
  secret: ISecretState,
  board: ICard[],
  trash: ICard[],
  publicHands: { '0': ICard[], '1': ICard[] },
  players: { '0': IPlayerState, '1': IPlayerState },
  stopped: boolean,
}

// card helpers

const CARD_NUMS: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const CARD_SUITS: string[] = ['s', 'd', 'h', 'c'];
const makeCard = (cardNum: string, cardSuit: string): ICard => `${cardNum}${cardSuit}`

const moveCard = (src: ICard[], card: ICard, dest: ICard[]) => {
  const i = src.indexOf(card);
  assert(i !== -1);
  _.pullAt(src, i);
  dest.push(card);
}

const change = (G: GameState, ctx: IGameCtx, myHandCard: ICard, boardCard: ICard) => {
  const hand = G.players[ctx.currentPlayer].hand;
  const publicHand = G.publicHands[ctx.currentPlayer];
  assert(hand.includes(myHandCard));

  const board = G.board;
  assert(board.includes(boardCard));

  moveCard(hand, myHandCard, board);
  _.pull(publicHand, myHandCard);
  moveCard(board, boardCard, hand);
  publicHand.push(boardCard);
}

const throwAndChange = (G: GameState, ctx: IGameCtx, myHandCard: ICard, boardCard: ICard) => {
  const hand = G.players[ctx.currentPlayer].hand;
  const publicHand = G.publicHands[ctx.currentPlayer];
  assert(hand.includes(myHandCard));

  const board = G.board;
  assert(board.includes(boardCard));

  const deck = G.secret.deck;

  moveCard(hand, myHandCard, board);
  _.pull(publicHand, myHandCard);
  moveCard(board, boardCard, G.trash);
  hand.push(deck.pop()!)
}

export const ShizuokaPokerGame = Game<GameState>({
  name: 'shizuoka-poker',
  setup: () => {
    const allCards: ICard[] = [];
    CARD_NUMS.forEach(n => {
      CARD_SUITS.forEach(s => {
        allCards.push(makeCard(n, s));
      });
    });
    allCards.push(CARD_NUMS[0])
    const deck = _.shuffle(allCards);
    const board: ICard[] = [];
    const p0Hand: ICard[] = [];
    const p1Hand: ICard[] = [];
    _.times(5, () => board.push(deck.pop()!));
    _.times(5, () => p0Hand.push(deck.pop()!));
    _.times(5, () => p1Hand.push(deck.pop()!));

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
      stopped: false,
    };
  },
  moves: {
    change,
    throwAndChange,
    skip: (G) => { console.log('skip!') },
    stop: (G) => { G.stopped = true },
  },
  flow: {
    movesPerTurn: 1,
    // endTurnIf: () => { console.log('endTurnif'); return true },
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
        endPhaseIf: () => true, // TODO
      },
    ],
    endGameIf: (G, ctx) => {
    }
  },
  playerView: PlayerView.STRIP_SECRETS
})

export const ShizuokaPokerAI = AI<GameState>({
  enumerate: (G, ctx) => {
    let moves: IAIMoveObj[] = [
      {
        move: 'skip',
        args: [],
      }
    ];
    // TODO
    return moves;
  },
})