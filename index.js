import _ from "lodash";
class DataPart {
  #shuffledCards;
  #allPiles;

  constructor() {
    this.#shuffledCards = [];
    this.#allPiles = {};
  }
  generateCards() {
    const cards = [];
    const specialNums = { 13: "K", 12: "Q", 11: "J", 1: "A" };
    for (let i = 0; i < 104; i++) {
      let card = (i % 13) + 1;
      if (card in specialNums) {
        card = specialNums[card];
      }
      cards.push({ value: card, isFaceUp: false });
    }
    return cards;
  }

  shuffleCards() {
    const cards = _.shuffle(this.generateCards());
    this.#shuffledCards.push(...cards);
  }

  get shuffledCards() {
    return this.#shuffledCards;
  }
  setupTableau() {
    for (let column = 1; column <= 10; column++) {
      const spliceCount = column < 5 ? 6 : 5;
      const splicedArray = this.#shuffledCards.splice(0, spliceCount);
      splicedArray.at(-1).isFaceUp = true;
      this.#allPiles[`pile${column}`] = splicedArray;
    }
  }
}

class ViewPart {
  #allPiles;
  constructor() {
    this.#allPiles = {};
  }

  displayTableau() {
    const tableau = _.map(this.#allPiles, (value, key) => {
      const cards = value
        .map((card) => {
          const displayValue = card.isFaceUp ? card.value : "X";
          return displayValue;
        })
        .join(" ");
      return key + " " + cards;
    }).join("\n");
    console.log(tableau);
  }
  get allPiles() {
    return this.#allPiles;
  }
}

class ControllerPart {
  #tableau;
  constructor(tableau) {
    this.#tableau = tableau;
  }
  #areAllOpen(cards) {
    return cards.every(({ isFaceUp }) => isFaceUp);
  }
  #areAllInOrder(cards) {
    return cards.every(
      ({ value }, index, cards) =>
        index === 0 || cards[index - 1].value === value + 1
    );
  }
  #isMoveAllowed(fromCard, toCard) {
    return fromCard === toCard - 1;
  }

  isValidMove(from, to, noOfCards) {
    const fromCards = _.takeRight(this.#tableau.allPiles[from], noOfCards);
    const toLastCard = this.#tableau.allPiles[to].at(-1);
    console.log("fromCards : ", fromCards, "toLastCard :", toLastCard);
    return (
      this.#areAllOpen(fromCards) &&
      this.#areAllInOrder(fromCards) &&
      this.#isMoveAllowed(fromCards[0].value, toLastCard.value)
    );
  }

  #openLastCard(card) {
    if (!card.isFaceUp) card.isFaceUp = true;
  }

  moveCards(from, to, noOfCards) {
    const fromPile = this.#tableau.allPiles[from];
    const toPile = this.#tableau.allPiles[to];
    const fromCards = fromPile.splice(-noOfCards, noOfCards);
    this.#openLastCard(fromPile.at(-1));
    toPile.push(...fromCards);
  }
}

const userMoves = () => {
  const fromPile = prompt("from :: ");
  const toPile = prompt("to :: ");
  const noOfCards = Number(prompt("noOfCards :: "));
  return [fromPile, toPile, noOfCards];
};

const playGame = (tableau) => {
  const game = new ControllerPart(tableau);

  tableau.displayTableau();
  const [from, to, noOfCards] = userMoves();

  if (game.isValidMove(from, to, noOfCards)) {
    game.moveCards(from, to, noOfCards);
    tableau.displayTableau();
    console.log("✅ moved successfully");
  } else {
    console.log("❌ invalid move");
  }
};

const main = () => {
  const deck = new DataPart();
  deck.generateCards();
  deck.shuffleCards();
  const tableau = new ViewPart(deck.shuffledCards);
  tableau.setupTableau();
  tableau.displayTableau();
  playGame(deck, tableau);
};

main();
