import _ from 'lodash'
import { Game, PlayerView, IGameCtx } from 'boardgame.io/core';
import { AI, IAIMoveObj } from 'boardgame.io/ai'
import { Hand as PokerHand } from 'pokersolver'
import assert from 'power-assert';

export type ICard = string;

type ISecretState = { deck: ICard[] };
type IGuess = { rank: number, cardRank: number };
type IPlayerState = { hand: ICard[], guess: IGuess | null };

export type GameState = {
  secret: ISecretState,
  board: ICard[],
  trash: ICard[],
  publicHands: { '0': ICard[], '1': ICard[] },
  players: { '0': IPlayerState, '1': IPlayerState },
  stopped: boolean,
}

export const CARD_NUMS: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const CARD_SUITS: string[] = ['s', 'd', 'h', 'c'];
const makeCard = (cardNum: string, cardSuit: string): ICard => `${cardNum}${cardSuit}`

const change = (G: GameState, ctx: IGameCtx, myHandCard: ICard, boardCard: ICard) => {
  const hand = G.players[ctx.currentPlayer].hand;
  const publicHand = G.publicHands[ctx.currentPlayer];
  const board = G.board;

  const myHandIndex = hand.indexOf(myHandCard);
  assert(myHandIndex !== -1);
  const boardIndex = board.indexOf(boardCard);
  assert(boardIndex !== -1);
  board[boardIndex] = myHandCard;
  hand[myHandIndex] = boardCard;
  _.pull(publicHand, myHandCard);
  publicHand.push(boardCard);
}

const throwAndChange = (G: GameState, ctx: IGameCtx, myHandCard: ICard, boardCard: ICard) => {
  // TODO: https://github.com/nicolodavis/boardgame.io/issues/298
  if (!G.secret) {
    return;
  }

  const hand = G.players[ctx.currentPlayer].hand;
  const publicHand = G.publicHands[ctx.currentPlayer];
  const board = G.board;

  assert(hand.includes(myHandCard));

  assert(board.includes(boardCard));

  const myHandIndex = hand.indexOf(myHandCard);
  assert(myHandIndex !== -1);
  const boardIndex = board.indexOf(boardCard);
  assert(boardIndex !== -1);

  const deck = G.secret.deck;
  const newCard = deck.pop()!

  G.trash.push(boardCard);
  board[boardIndex] = myHandCard;
  hand[myHandIndex] = newCard;
  _.pull(publicHand, myHandCard);
}

const guess = (G: GameState, ctx: IGameCtx, rank: number, cardRank: number) => {

};

const endGame = (G: GameState, ctx: IGameCtx) => {
  return { winner: '0' };
};

export const ShizuokaPokerGame = Game<GameState>({
  name: 'shizuoka-poker',
  setup: () => {
    const allCards: ICard[] = [];
    CARD_NUMS.forEach(n => {
      CARD_SUITS.forEach(s => {
        allCards.push(makeCard(n, s));
      });
    });
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
          guess: null,
        },
        '1': {
          hand: p1Hand,
          guess: null,
        },
      },
      stopped: false,
    };
  },
  moves: {
    change,
    throwAndChange,
    skip: () => { },
    guess,
    stop: (G) => { G.stopped = true },
  },
  flow: {
    movesPerTurn: 1,
    optimisticUpdate: () => false,
    startingPhase: 'change',
    phases: {
      change: {
        allowedMoves: ['change', 'throwAndChange'],
        endPhaseIf: (G, ctx) => ctx.turn >= 2,
        next: 'stoppableChange',
      },
      stoppableChange: {
        allowedMoves: ['change', 'throwAndChange', 'stop'],
        endPhaseIf: (G) => G.stopped,
        next: 'lastChange',
      },
      lastChange: {
        allowedMoves: ['change', 'throwAndChange', 'skip'],
        endPhaseIf: () => true, // TODO
        next: 'guess',
      },
      guess: {
        allowedMoves: ['guess'],
        endGameIf: (G) => G.players['0'].guess && G.players['1'].guess,
      },
    },
    endGameIf: (G, ctx) => {
    },
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

export const pokerHandInfo = (hand: ICard[]) => {
  const pokerHand = PokerHand.solve(hand)
  return {
    name: pokerHand.name,
    rank: pokerHand.rank,
    cardRank: (pokerHand as any).cards[0].rank,
  }
}