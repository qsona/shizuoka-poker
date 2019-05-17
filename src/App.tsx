import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react';
import { Client } from 'boardgame.io/react';
import { IGameCtx, IPlayer } from 'boardgame.io/core';
import { ShizuokaPokerGame, GameState, ShizuokaPokerAI, ICard } from './ShizuokaPoker'

interface IProps {
  moves: any;
  events: any;
  isActive: boolean;
  G: GameState;
  ctx: IGameCtx;
  playerID: IPlayer;
}

const ShizuokaPokerBoard: React.FC<IProps> = (props) => {
  const playerID = props.playerID;
  console.log(props)
  const [selectedBoardCard, setSelectedBoardCard] = useState<ICard | null>(null);
  const [selectedMyCard, setSelectedMyCard] = useState<ICard | null>(null);
  const [isTrashSelected, setTrashSelected] = useState<boolean>(false);

  const opponentPlayer: IPlayer = playerID === '0' ? '1' : '0';

  function toggleMyCard(card: ICard) {
    setSelectedMyCard(card === selectedMyCard ? null : card);
  }

  function toggleBoardCard(card: ICard) {
    console.log(card)
    console.log(card === selectedBoardCard)
    setSelectedBoardCard(card === selectedBoardCard ? null : card);
  }

  function toggleTrash() {
    setTrashSelected(!isTrashSelected);
  }

  useEffect(() => {
    console.log(`${selectedBoardCard} ${selectedMyCard}`)
    if (selectedMyCard && selectedBoardCard) {
      // TODO: move!
      console.log("change to card")
      if (isTrashSelected) {
        props.moves.throwAndChange(selectedMyCard, selectedBoardCard)
      } else {
        props.moves.change(selectedMyCard, selectedBoardCard)
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

  const tboard = props.G.board.map((c, i) => {
    return (
      <td style={cellStyle} key={i} onClick={() => toggleBoardCard(c)}>
        {c}
      </td>
    )
  });
  const thand = props.G.players[playerID].hand.map((c, i) => {
    const style: React.CSSProperties = { ...cellStyle };
    if (!props.G.publicHands[playerID].includes(c)) {
      style.backgroundColor = 'gray'
    }
    return (
      <td style={style} key={i} onClick={() => toggleMyCard(c)}>
        {c}
      </td>
    )
  })

  const topponent = [0, 1, 2, 3, 4].map(i => {
    const c = props.G.publicHands[opponentPlayer][i] || '';
    return (
      <td style={cellStyle} key={i} >
        {c}
      </td>
    )
  })

  const trashStyle = { ...cellStyle };
  if (isTrashSelected) {
    trashStyle.backgroundColor = 'pink';
  }

  return (
    <div>
      <p>opponent public hand</p>
      <table id="opponent"><tbody><tr>{topponent}</tr></tbody></table>
      <p>board</p>
      <table id="board"><tbody><tr>{tboard}</tr></tbody></table>
      <p>hand</p>
      <table id="hand"><tbody><tr>{thand}</tr></tbody></table>
      <table id="trash"><tbody><tr>
        <td style={trashStyle} key="0" onClick={() => toggleTrash()}>Trash</td>
      </tr></tbody></table>


      <p>---logs---</p>

      <p>board: {JSON.stringify(props.G.board)}</p>
      <p>hand: {JSON.stringify(props.G.players[playerID].hand)}</p>
      <p>publicHand 0: {JSON.stringify(props.G.publicHands[0])}</p>
      <p>publicHand 1: {JSON.stringify(props.G.publicHands[1])}</p>
      <p>trash: {JSON.stringify(props.G.trash)}</p>
    </div>
  );
}

const App: any = Client({
  game: ShizuokaPokerGame,
  board: ShizuokaPokerBoard,
  multiplayer: { server: 'localhost:8000' },
  ai: ShizuokaPokerAI,
});

const RealApp: React.FC = () => {
  return (
    <div>
      <App gameID="gameid" playerID="0"></App>
      <p>================================</p>
      <App gameID="gameid" playerID="1"></App>
    </div>
  )
}

export default RealApp;
