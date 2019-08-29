import React from 'react';
import './App.css';

import { useState, useEffect } from 'react';
import { Client } from 'boardgame.io/react';
import { IGameCtx, IPlayer } from 'boardgame.io/core';
import { ShizuokaPokerGame, GameState, ShizuokaPokerAI, ICard, pokerHandInfo } from './ShizuokaPoker'
// import Card from 'react-playing-card';
// import { Card, RANKS, SUITS } from 'react-playing-cards';
import Card from './components/Card'
import BackCard from './components/BackCard'

interface IProps {
  moves: any;
  events: any;
  isActive: boolean;
  G: GameState;
  ctx: IGameCtx;
  playerID: IPlayer;
}

const ShizuokaPokerBoard: React.FC<IProps> = (props) => {
  const { playerID, G, ctx, moves } = props;
  console.log(props)
  const [selectedBoardCard, setSelectedBoardCard] = useState<ICard | null>(null);
  const [selectedMyCard, setSelectedMyCard] = useState<ICard | null>(null);
  const [isTrashSelected, setTrashSelected] = useState<boolean>(false);

  const [selectedGuessRank, setSelectedGuessRank] = useState<number>(9);
  const [selectedGuessCardRank, setSelectedGuessCardRank] = useState<number>(14);
  const handleGuessRankChange = (e: any) => {
    const value = +e.target.value;
    setSelectedGuessRank(value);
  }
  const handleGuessCardRankChange = (e: any) => {
    const value = +e.target.value;
    setSelectedGuessCardRank(value);
  }
  const handleGuessDecide = () => {
    moves.guess(selectedGuessRank, selectedGuessCardRank);
  }

  const opponentPlayer: IPlayer = playerID === '0' ? '1' : '0';

  function toggleMyCard(card: ICard) {
    setSelectedMyCard(card === selectedMyCard ? null : card);
  }

  function toggleBoardCard(card: ICard) {
    setSelectedBoardCard(card === selectedBoardCard ? null : card);
  }

  function toggleTrash() {
    setTrashSelected(!isTrashSelected);
  }

  useEffect(() => {
    if (selectedMyCard && selectedBoardCard) {
      if (isTrashSelected) {
        moves.throwAndChange(selectedMyCard, selectedBoardCard)
      } else {
        moves.change(selectedMyCard, selectedBoardCard)
      }
      resetSelectedCards()
    }
  }, [selectedBoardCard, selectedMyCard]);

  function resetSelectedCards() {
    setSelectedBoardCard(null);
    setSelectedMyCard(null);
    setTrashSelected(false);
  }

  const cellStyle: React.CSSProperties = {
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '50px',
    textAlign: 'center',
  };

  const tboard = G.board.map((c, i) => {
    return (
      <td key={i} onClick={() => toggleBoardCard(c)}>
        <Card card={c} isPublic={true} isSelected={c === selectedBoardCard} />
      </td>
    )
  });
  const thand = G.players[playerID].hand.map((c, i) => {
    const isPublic = G.publicHands[playerID].includes(c)
    return (
      <td key={i} onClick={() => toggleMyCard(c)}>
        {<Card card={c} isPublic={isPublic} isSelected={c === selectedMyCard} />}
      </td>
    )
  })
  const handInfo = pokerHandInfo(G.players[playerID].hand);

  const topponent = [0, 1, 2, 3, 4].map(i => {
    const style: React.CSSProperties = { ...cellStyle };
    const c = G.publicHands[opponentPlayer][i];
    if (!c) {
      style.backgroundColor = 'gray'
    }
    return (
      <td key={i}>
        {c ? <Card card={c} isPublic={true} /> : <BackCard />}
      </td>
    )
  })

  const operationStyle = (isSelected: boolean) => {
    const style = { ...cellStyle };
    if (isSelected) {
      style.backgroundColor = 'pink';
    }
    return style;
  }

  return (
    <div>
      <p>opponent public hand</p>
      <table id="opponent"><tbody><tr>{topponent}</tr></tbody></table>
      <p>board</p>
      <table id="board"><tbody><tr>{tboard}</tr></tbody></table>
      <table id="operation"><tbody><tr>
        {
          ctx.currentPlayer === playerID ?
            <td style={operationStyle(true)} key="-1">YOUR TURN</td> :
            <td style={operationStyle(false)} key="-1">Waiting...</td>
        }
        {
          ctx.allowedMoves.includes('throwAndChange') &&
          <td style={operationStyle(isTrashSelected)} key="0" onClick={() => toggleTrash()}>Deck</td>
        }
        {
          ctx.currentPlayer === playerID && ctx.allowedMoves.includes('stop') &&
          <td style={operationStyle(false)} key="1" onClick={() => moves.stop()}>Stop</td>
        }
        {
          G.stopped &&
          <td style={operationStyle(true)} key="2">STOPPED!</td>
        }
        {
          ctx.currentPlayer === playerID && ctx.allowedMoves.includes('skip') &&
          <td style={operationStyle(false)} key="3" onClick={() => moves.skip()}>Skip</td>
        }
        {
          ctx.currentPlayer === playerID && ctx.allowedMoves.includes('guess') &&
          <td style={operationStyle(false)} key="4">
            <select value={selectedGuessRank} onChange={handleGuessRankChange}>
              <option value="1">High Card</option>
              <option value="2">One Pair</option>
              <option value="3">Two Pair</option>
              <option value="4">Three of a kind</option>
              <option value="5">Straight</option>
              <option value="6">Flush</option>
              <option value="7">Full house</option>
              <option value="8">Four of a kind</option>
              <option value="9">Straight flush</option>
            </select>
            <select value={selectedGuessCardRank} onChange={handleGuessCardRankChange}>
              <option value="1">2</option>
              <option value="2">3</option>
              <option value="3">4</option>
              <option value="4">5</option>
              <option value="5">6</option>
              <option value="6">7</option>
              <option value="7">8</option>
              <option value="8">9</option>
              <option value="9">10</option>
              <option value="10">J</option>
              <option value="11">Q</option>
              <option value="12">K</option>
              <option value="13">A</option>
            </select>
            <button onClick={handleGuessDecide}>Guess!</button>
          </td>
        }
        {
          ctx.gameover &&
          <td style={operationStyle(false)} key="5">
            {ctx.gameover.winner === playerID ? 'YOU WIN!' : ctx.gameover.draw ? 'DRAW' : 'YOU LOSE!'} <br />
          </td>
        }
      </tr></tbody></table>
      <p>hand</p>
      <table id="hand"><tbody><tr>{thand}</tr></tbody></table>
      <p>hand: {`${handInfo.name} (rank ${handInfo.rank}, cardRank ${handInfo.cardRank})`}</p>
    </div>
  );
}

const App: any = Client({
  game: ShizuokaPokerGame,
  board: ShizuokaPokerBoard,
  multiplayer: { server: 'https://shizuoka-poker-server.herokuapp.com' },
  ai: ShizuokaPokerAI,
});

const RealApp: React.FC = () => {
  const [playerID, setPlayerID] = useState<string | null>(null);
  if (playerID == null) {
    return (
      <div>
        <p>Play as</p>
        <button onClick={() => setPlayerID("0")}>
          Player 0
        </button>
        <button onClick={() => setPlayerID("1")}>
          Player 1
        </button>
      </div>
    );
  }
  return (
    <div>
      <App playerID={playerID} />
    </div>
  );
}

export default RealApp;
