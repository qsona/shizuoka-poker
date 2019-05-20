import React from 'react';

interface IProps {
  rank: string;
  suit: string;
}
const Card: React.FC<IProps> = (props) => {
  const rankForCardsJS = props.rank === 'T' ? '10' : props.rank
  const suitForCardJS = props.suit.toUpperCase()
  return (
    <img className='card' src={`https://unpkg.com/cardsJS/dist/cards/${rankForCardsJS}${suitForCardJS}.svg`} />
  )
};

export default Card;