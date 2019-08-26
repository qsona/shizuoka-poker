import React from 'react';

interface IProps {
  card: string;
  isPublic?: boolean;
}
const Card: React.FC<IProps> = (props) => {
  const rank = props.card[0]
  const suit = props.card[1]
  const rankForCardsJS = rank === 'T' ? '10' : rank
  const suitForCardJS = suit.toUpperCase()
  return (
    <img className='card' style={{ opacity: props.isPublic ? 1 : 0.4 }} src={`https://unpkg.com/cardsJS/dist/cards/${rankForCardsJS}${suitForCardJS}.svg`} />
  )
};

export default Card;