declare module 'react-playing-card' {
  import * as React from 'react';
  interface ICardProps {
    rank: string;
    suit: string;
  }
  export default class Card extends React.Component<ICardProps, {}> {

  }
}