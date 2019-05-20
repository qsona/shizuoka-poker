import React from 'react';

interface IProps {
  card: string;
}
const Card: React.FC<IProps> = (props) => {
  const rank = props.card[0]
  const suit = props.card[1]
  const rankForCardsJS = rank === 'T' ? '10' : rank
  const suitForCardJS = suit.toUpperCase()
  return (
    <img className='card' src={`https://unpkg.com/cardsJS/dist/cards/${rankForCardsJS}${suitForCardJS}.svg`} />
  )
};

export default Card;