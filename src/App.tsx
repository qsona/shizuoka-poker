import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react';
import { Client } from 'boardgame.io/react';
import { IGameCtx } from 'boardgame.io/core';
import { ShizuokaPokerGame, GameState, ShizuokaPokerAI, ICard } from './ShizuokaPoker'

interface IProps {
  moves: any;
  events: any;
  isActive: boolean;
  G: GameState;
  ctx: IGameCtx;
}

const ShizuokaPokerBoard: React.FC<IProps> = (props) => {
  const [selectedBoardCard, setSelectedBoardCard] = useState<ICard | null>(null);
  const [selectedMyCard, setSelectedMyCard] = useState<ICard | null>(null);
  const [isTrashSelected, setTrashSelected] = useState<boolean>(false);


  function toggleMyCard(card: ICard) {
    setSelectedMyCard(card === selectedMyCard ? null : card);
  }

  function toggleBoardCard(card: ICard) {
    console.log(card)
    console.log(card === selectedBoardCard)
    setSelectedBoardCard(card === selectedBoardCard ? null : card);
    setTrashSelected(false);
  }

  function toggleTrash() {
    setTrashSelected(!isTrashSelected);
    setSelectedBoardCard(null);
  }

  // function checkSelectedCards() {
  useEffect(() => {
    console.log(`${selectedBoardCard} ${selectedMyCard} ${isTrashSelected}`)
    if (selectedMyCard) {
      if (isTrashSelected) {
        // TODO: move!
        console.log("change to trash")
        props.moves.throwAndChange(selectedMyCard)
        resetSelectedCards()
      } else if (selectedBoardCard) {
        // TODO: move!
        console.log("change to card")
        props.moves.change(selectedMyCard, selectedBoardCard)
        resetSelectedCards()
      }
    }
  }, [selectedBoardCard, selectedMyCard, isTrashSelected]);

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
  const thand = props.G.players[0].hand.map((c, i) => {
    const style: React.CSSProperties = { ...cellStyle };
    if (props.G.publicHands[0].includes(c)) {
      style.backgroundColor = 'gray'
    }
    return (
      <td style={style} key={i} onClick={() => toggleMyCard(c)}>
        {c}
      </td>
    )
  })
  const topponent = [0, 1, 2, 3, 4].map(i => {
    const c = props.G.publicHands[1][i] || '';
    return (
      <td style={cellStyle} key={i} >
        {c}
      </td>
    )
  })

  // let tbody: JSX.Element[] = [];
  // for (let i = 0; i < 3; i++) {
  //   let cells: JSX.Element[] = [];
  //   for (let j = 0; j < 3; j++) {
  //     const id = 3 * i + j;
  //     cells.push(
  //       <td style={cellStyle} key={id} onClick={() => onClick(id)}>
  //         {props.G.cells[id]}
  //       </td>
  //     );
  //   }
  //   tbody.push(<tr key={i}>{cells}</tr>);
  // }

  return (
    <div>
      <p>opponent public hand</p>
      <table id="opponent"><tbody><tr>{topponent}</tr></tbody></table>
      <p>board</p>
      <table id="board"><tbody><tr>{tboard}</tr></tbody></table>
      <p>hand</p>
      <table id="hand"><tbody><tr>{thand}</tr></tbody></table>
      <table id="trash"><tbody><tr>
        <td style={cellStyle} key="0" onClick={() => toggleTrash()}>Trash</td>
      </tr></tbody></table>

      <p>---logs---</p>

      <p>board: {JSON.stringify(props.G.board)}</p>
      <p>hand: {JSON.stringify(props.G.players[0].hand)}</p>
      <p>publicHand 0: {JSON.stringify(props.G.publicHands[0])}</p>
      <p>publicHand 1: {JSON.stringify(props.G.publicHands[1])}</p>
      <p>trash: {JSON.stringify(props.G.trash)}</p>
    </div>
  );
}

const App: any = Client({
  game: ShizuokaPokerGame,
  board: ShizuokaPokerBoard,
  ai: ShizuokaPokerAI,
});

const RealApp: React.FC = () => {
  return (
    <div>
      <App gameID="gameid" playerID="0"></App>
    </div>
  )
}

export default RealApp;
