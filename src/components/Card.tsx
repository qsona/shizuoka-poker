import React from 'react';

interface IProps {
  card: string;
  isPublic?: boolean;
  isSelected?: boolean;
}
const Card: React.FC<IProps> = (props) => {
  const rank = props.card[0]
  const suit = props.card[1]
  const rankForCardJS = rank === 'T' ? '10' : rank
  const suitForCardJS = suit.toUpperCase()
  const classNames = ['card']
  if (props.isSelected) {
    classNames.push('card-selected')
  }
  return (
    <img className={classNames.join(' ')} style={{ opacity: props.isPublic ? 1 : 0.6 }} src={`https://unpkg.com/cardsJS/dist/cards/${rankForCardJS}${suitForCardJS}.svg`} />
  )
};

export default Card;