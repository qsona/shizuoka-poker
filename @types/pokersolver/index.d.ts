declare module 'pokersolver' {
  export class Hand {
    static solve(cards: string[]): Hand

    name: string
    rank: number
  }
}