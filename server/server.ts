import http from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card, getLastPlayedCard, computePlayerCardCounts, Config } from "./model"

const server = http.createServer()
const io = new Server(server)
const port = 8091

let config: Config = {numberOfDecks: 2, rankLimit: 2}

let gameState = createEmptyGame(["player1", "player2"], 2, 2)

function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter((card) => {card.locationType != "unused"})
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards", 
      updatedCardsFromPlayerPerspective,
    )
  })
  // emit last card
  io.emit("last-card", getLastPlayedCard(gameState.cardsById))
}

/**
 * finds list of player ids that have one card or less in hand
 */
function getAlmostFinishedPlayers() {
  let almostFinished: number[] = []
  // get count of cards in players hands 
  let counts: number[] = computePlayerCardCounts(gameState)
  console.log(counts)
  // check each player
  gameState.playerNames.forEach((_, i) => {
    // check if number of cards in hand <= 1
    if (counts[i] <= 1) {
      almostFinished.push(i)
    }
  })
  return almostFinished
}

io.on('connection', client => {
  function emitGameState() {
    client.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      getAlmostFinishedPlayers()
    )
  }

  client.on("card-created", (id) => {
    console.log("card-create:", id)
  })
  
  console.log("New client")
  let playerIndex: number | null | "all" = null
  client.on('player-index', n => {
    playerIndex = n
    console.log("playerIndex set", n)
    client.join(String(n))
    if (typeof playerIndex === "number") {
      client.emit(
        "all-cards", 
        filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
      )
    } else {
      client.emit(
        "all-cards", 
        Object.values(gameState.cardsById),    
      )
    }
    emitGameState()
  })

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards", 
      Object.values(gameState.cardsById),    
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      getAlmostFinishedPlayers()
    )
  })

  client.on("new-game", () => {
    gameState = createEmptyGame(gameState.playerNames, config.numberOfDecks, config.rankLimit)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards", 
      updatedCards,
    )
    emitGameState()
  })
  
  // listen to get config event
  client.on("get-config", () => {
    // emit current server config
    io.emit("get-config-reply", config)
  })

  // function to check if obj is a correct type of Config
  function isConfig(obj: any): obj is Config {
    // check number of keys, correct key names, correct key types
    return Object.keys(obj).length == 2 && obj.numberOfDecks !== undefined && obj.rankLimit !== undefined && typeof obj.numberOfDecks == "number" && typeof obj.rankLimit == "number"
  }

  // listen to update request
  client.on("update-config", (newConfig) => {
    // wait two seconds
    setTimeout(() => {
      // check if new config is of correct type
      if (isConfig(newConfig)) {
        // update server config
        config = newConfig
        io.emit("update-config-reply", true)
      } else {
        // refuse update
        io.emit("update-config-reply", false)
      }
    }, 2000);

  })
})

server.listen(port)
console.log(`Game server listening on port ${port}`)
