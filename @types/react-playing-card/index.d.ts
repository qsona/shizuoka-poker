declare module 'react-playing-card' {
  import * as React from 'react';
  interface ICardProps {
    rank: string;
    suit: string;
  }
  export default class Card extends React.Component<ICardProps, {}> {

  }
}
//{
//   //export default class Card extends React.Component<any, any> { };
//   export class Card {
//     static solve(cards: string[]): Hand

//     name(): string
//     rank(): number
//   }
//