import React from 'react';

interface IProps {
}
const Card: React.FC<IProps> = () => {
  return (
    <img className='card' src={`https://unpkg.com/cardsJS/dist/cards/Red_Back.svg`} />
  )
};

export default Card;
