const board = document.querySelector('main')
let fightArena = ''

// constructor function Game
function Game(activePlayer) {
  this.activePlayer = activePlayer
  this.squaresCounter = createRandomNumber(10, 20)

  //Create an array of objects with coordinates
  this.createSquaresArray = function () {
    let squaresArray = []
    for (let x = 1; x < 11; x++) {
      for (let y = 1; y < 11; y++) {
        let square = { row: x, column: y, state: 'free' }
        squaresArray.push(square)
      }
    }
    return squaresArray
  }

  // assign blocked-state to random squares
  this.blockSquares = function () {
    let num = createRandomNumber(0, squaresArray.length - 1)
    let square = squaresArray[num]
    let check = checkIfPathFree(square)
    let checkAll = squaresArray.map(square => checkIfPathFree(square))

    if (this.squaresCounter >= 1) {
      if (square.state === 'blocked') {
        this.blockSquares()
      } else if (check) {
        this.blockSquares()
      } else if (checkAll) {
        square.state = 'blocked'
        this.squaresCounter--
        this.blockSquares()
      }
    }
  }

  // placeItem and placeWeapon
  this.placeItem = function (item) {
    let randomSquare = createRandomNumber(0, squaresArray.length - 1)
    let square = squaresArray[randomSquare]

    const edge =
      square.row === 1 ||
      square.column === 1 ||
      square.row === 10 ||
      square.column === 10

    if (square.state != 'free' || edge) {
      this.placeItem(item)
    } else if (!checkIfPathFree(square)) {
      square.state = item.name
      item.position = { row: square.row, column: square.column }
    } else {
      this.placeItem(item)
    }
  }

  this.renderBoard = function () {
    // this.createSquaresArray()
    this.blockSquares()
    this.placeItem(playerOne)
    this.placeItem(playerTwo)
    this.placeItem(rocket)
    this.placeItem(wrench)
    this.placeItem(fire)
    this.placeItem(thunderbolt)

    const gridContainer = document.getElementById('game')
    squaresArray.map(obj => {
      let gridItem = document.createElement('div')
      gridItem.classList.add('grid-item')
      /*gridItem.innerHTML = `row: ${obj.row} col: ${obj.column}`*/
      gridItem.classList.add(obj.state)

      gridItem.setAttribute('data-row', obj.row)
      gridItem.setAttribute('data-column', obj.column)

      gridContainer.appendChild(gridItem)
    })
    showWay()
  }

  /* ------- MOVE PLAYER -------- */
  this.movePlayer = function ($this) {
    this.allPossibleSquares = document.querySelectorAll('.possible')
    let squareCheck = createTraversedSquares($this)
    if (squareCheck) {
      $(`.grid-item.${this.activePlayer.name} `)
        .addClass('free')
        .removeClass(`${this.activePlayer.name} `)
      $this.removeClass('free').addClass(`${this.activePlayer.name} `)

      this.activePlayer.position = {
        row: $this[0].attributes['data-row'].value,
        column: $this[0].attributes['data-column'].value,
      }
      activePlayer.collectWeapon($this)
      this.startFightLogic()

      this.allPossibleSquares.forEach(square => square.classList.remove('possible'))
      switchPlayers()
    } else {
      alert('You can\'t move diagonally or jump blocked squares')
    }
  }

  // start fight
  this.startFightLogic = function () {
    if (fight.checkIfFight()) {
      fight.playerChoice()
    }
  }
}

// constructor Function Fight
function Fight() {
  this.form
  // check if players are on adjacent squares
  this.checkIfFight = function () {
    let playerOneRow = playerOne.position.row
    let playerTwoRow = playerTwo.position.row
    let playerOneColumn = playerOne.position.column
    let playerTwoColumn = playerTwo.position.column

    let conditionOne = (playerOneRow == playerTwoRow) && (playerOneColumn - playerTwoColumn === 1)
    let conditionTwo = (playerOneRow == playerTwoRow) && (playerOneColumn - playerTwoColumn === -1)
    let conditionThree = (playerOneColumn == playerTwoColumn) && (playerOneRow - playerTwoRow === 1)
    let conditionFour = (playerOneColumn == playerTwoColumn) && (playerOneRow - playerTwoRow === -1)

    let isFirstFight = (playerOne.healthscore === 100) && (playerTwo.healthscore === 100)

    if (conditionOne || conditionTwo || conditionThree || conditionFour) {
      this.renderFightArena(isFirstFight)
      return true
    } else {
      return false
    }
  }

  // Create Pop-up fight arena
  this.renderFightArena = function (isFirstFight) {
    this.checkWhoAttacks()
    let defendingPlayer

    if (playerOne.status === 'defending') {
      defendingPlayer = playerOne
    } else {
      defendingPlayer = playerTwo
    }
    let fightArenaHTML =
      `<div class="fight-view">
        <h4>DEFEND</h4>
        <p> lower the attacks impact by 50%</p> 
      </div>
    <div class="choiceForm">
      <h2 class="js-defending-player">${defendingPlayer.name} choose:</h2>
      <form id = "choiceForm" action = "input" >
      <button name="defendButton" type="submit" class="defend" value="defend">defend</button>
      <button name="attackButton " type="submit" class="attack" value="attack">attack</button>
  </form >
    </div>
  <div class="fight-view">
    <h4>ATTACK</h4>
       <p> attack back with 100% impact </p>
  </div>`

    if (isFirstFight === true) {
      board.insertAdjacentHTML('beforeend', `<div class="fight_arena">${fightArenaHTML}</div>`)
      fightArena = document.querySelector('.fight_arena')
    } else {
      this.updateFightArena(defendingPlayer)
      fightArena.classList.remove('hidden')
    }
  }

  // check which player attacks
  this.checkWhoAttacks = function () {
    if (game.activePlayer === playerOne) {
      playerOne.status = 'attacking'
      playerTwo.status = 'defending'
    } else {
      playerTwo.status = 'attacking'
      playerOne.status = 'defending'
    }
  }

  // get value from clicked button in order to determine wether the attacked player defends or attacks back
  this.playerChoice = function () {
    this.form = document.getElementById('choiceForm')
    $('#choiceForm').on('click', 'button', function () {
      event.preventDefault()
      let playerChoice = this.value
      fight.fight(playerChoice)
      $("#choiceForm").unbind("click")
    })
  }

  // execute fight after playerChoice
  this.fight = function (playerChoice) {
    let defendingPlayer
    let attackingPlayer
    let defendingPlayerChoice = playerChoice

    if (playerOne.status === 'defending') {
      defendingPlayer = playerOne
      attackingPlayer = playerTwo
    } else {
      defendingPlayer = playerTwo
      attackingPlayer = playerOne
    }

    attackingPlayerWeapon = attackingPlayer.weapon.power
    defendingPlayerWeapon = defendingPlayer.weapon.power

    if (defendingPlayerChoice === 'defend') {
      defendingPlayer.healthscore -= (attackingPlayerWeapon * 0.5)
    } else {
      defendingPlayer.healthscore -= attackingPlayerWeapon
      attackingPlayer.healthscore -= defendingPlayerWeapon
    }
    this.updateFightArena(defendingPlayer)
    checkWin()
  }

  // Updates values in the fight arena pop-up
  this.updateFightArena = function (defendingPlayer) {
    const jsOneWeapon = document.querySelector('.js-pOneWeapon')
    const jsOneWeaponPower = document.querySelector('.js-pOneWeaponPower')
    const jsTwoWeapon = document.querySelector('.js-pTwoWeapon')
    const jsTwoWeaponPower = document.querySelector('.js-pTwoWeaponPower')
    const jsOne = document.querySelector('.js-pOneHealth')
    const jsTwo = document.querySelector('.js-pTwoHealth')
    const jsPlayerChoiceForm = document.querySelector('.js-defending-player')

    if (defendingPlayer) {
      jsPlayerChoiceForm.innerHTML = `${defendingPlayer.name} choose:`
    }

    jsOne.innerHTML = playerOne.healthscore
    jsTwo.innerHTML = playerTwo.healthscore
    jsOneWeapon.innerHTML = playerOne.weapon.name
    jsOneWeaponPower.innerHTML = playerOne.weapon.power
    jsTwoWeapon.innerHTML = playerTwo.weapon.name
    jsTwoWeaponPower.innerHTML = playerTwo.weapon.power
  }
}

class Player {
  constructor(name, image, healthscore, weapon) {
    this.name = name
    this.image = image
    this.healthscore = healthscore
    this.weapon = weapon
  }

  //checks if target square contains a weapon and if so adds it to the weapon key in player object
  collectWeapon = function ($clickedSquare) {
    if ($clickedSquare.hasClass('wrench')) {
      weaponSwitch($clickedSquare, 'wrench', wrench)
    } else if ($clickedSquare.hasClass('rocket')) {
      weaponSwitch($clickedSquare, 'rocket', rocket)
    } else if ($clickedSquare.hasClass('thunderbolt')) {
      weaponSwitch($clickedSquare, 'thunderbolt', thunderbolt)
    } else if ($clickedSquare.hasClass('fire')) {
      weaponSwitch($clickedSquare, 'fire', fire)
    }
  }
}

class Weapon {
  constructor(name, image, power) {
    this.name = name,
      this.power = power,
      this.image = image
  }
}

const wrench = new Weapon('wrench', 'image', 10)
const rocket = new Weapon('rocket', 'image', 30)
const fire = new Weapon('fire', 'image', 20)
const thunderbolt = new Weapon('thunderbolt', 'image', 40)
const playerOne = new Player('playerOne', 'image', 100, wrench)
const playerTwo = new Player('playerTwo', 'image', 100, wrench)

let game = new Game(playerOne)
let fight = new Fight()
const squaresArray = game.createSquaresArray()

/* -------------------------  helper functions ------------------------ */

// switch weapon classes on node and player object
function weaponSwitch($clickedSquare, weaponString, weapon) {
  $clickedSquare.removeClass(weaponString)
  $clickedSquare.addClass(game.activePlayer.weapon.name)
  game.activePlayer.weapon = weapon
  $clickedSquare.addClass(game.activePlayer.name)
  fight.updateFightArena()
}
// check if one of the players has 0 or less healthscore points
function checkWin() {
  if (playerOne.healthscore <= 0) {
    board.innerHTML = `
    <p class="win">Player Two won</p>
    <p>Player One lost</p>
    <button class="restart">Play again</button>`
    $('.restart').on('click', function () {
      location.reload();
    });

  } else if (playerTwo.healthscore <= 0) {
    board.innerHTML = `
    <p class="win">Player One won</p>
    <p>Player Two lost</p>
    <button class="restart">Play again</button>`
    $('.restart').on('click', function () {
      location.reload();
    });

  } else {
    setTimeout(() =>
      fightArena.classList.add('hidden'), 0500)
  }
}
// creates a random number between
function createRandomNumber(min, max) {
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
  return randomNumber
}
// check if the path around the item is free and is used to render board 
function checkIfPathFree(square) {
  let row = square.row
  let col = square.column

  let north = row - 1
  let south = row + 1
  let east = col + 1
  let west = col - 1

  function isNorth(obj) {
    return obj.row === north && obj.column === col
  }
  function isSouth(obj) {
    return obj.row === south && obj.column === col
  }
  function isEast(obj) {
    return obj.row === row && obj.column === east
  }
  function isWest(obj) {
    return obj.row === row && obj.column === west
  }
  /* at least 3 adjacent squares have to be unblocked for a square to be considered free */
  if (
    square.row === 1 ||
    square.column === 1 ||
    square.row === 10 ||
    square.column === 10
  ) {
    return true
  } else {
    if (
      square.state === 'free' &&
      ((squaresArray.find(isNorth).state === 'blocked' &&
        squaresArray.find(isEast).state === 'blocked' &&
        squaresArray.find(isWest).state === 'blocked') ||
        (squaresArray.find(isNorth).state === 'blocked' &&
          squaresArray.find(isWest).state === 'blocked' &&
          squaresArray.find(isSouth).state === 'blocked') ||
        (squaresArray.find(isNorth).state === 'blocked' &&
          squaresArray.find(isEast).state === 'blocked' &&
          squaresArray.find(isSouth).state === 'blocked') ||
        (squaresArray.find(isSouth).state === 'blocked' &&
          squaresArray.find(isWest).state === 'blocked' &&
          squaresArray.find(isEast).state === 'blocked'))
    ) {
      return true
    } else if (
      (squaresArray.find(isNorth).state === 'playerOne') ||
      (squaresArray.find(isSouth).state === 'playerOne') ||
      (squaresArray.find(isEast).state === 'playerOne') ||
      (squaresArray.find(isWest).state === 'playerOne')) {
      return true
    } else {
      return false
    }
  }
}
// creates an array containing all squares between current player position and the clicked square
function createTraversedSquares($clickedSquare) {
  let playerRow = game.activePlayer.position.row
  let playerColumn = game.activePlayer.position.column

  let squareColumn = $clickedSquare.attr('data-column')
  let squareRow = $clickedSquare.attr('data-row')

  const northSouth = squareRow - playerRow
  const eastWest = squareColumn - playerColumn

  let traversedSquares = []
  let isBlocked

  //if traveling north or south, create an array of traversed squares
  if (eastWest === 0 && parseInt(northSouth) <= 3) {
    if (northSouth >= 0) {
      //south
      for (let i = 0; i <= northSouth; i++) {
        let thisSquare = { thisRow: parseInt(playerRow) + i, thisColumn: playerColumn }
        traversedSquares.push(thisSquare)
      }
    } else if (northSouth <= 0) {
      //north
      for (let i = 0; i >= northSouth; i--) {
        let thisSquare = { thisRow: parseInt(playerRow) + i, thisColumn: playerColumn }
        traversedSquares.push(thisSquare)
      }
    }
    isBlocked = checkTraversedSquares(traversedSquares)
    return isBlocked;
  } else if (northSouth === 0 && parseInt(eastWest) <= 3) {
    //east
    if (eastWest > 0) {
      for (let i = 0; i <= eastWest; i++) {
        let thisSquare = { thisRow: playerRow, thisColumn: parseInt(playerColumn) + i }
        traversedSquares.push(thisSquare)
      }
    } else if (eastWest < 0) {
      //west
      for (let i = 0; i >= eastWest; i--) {
        let thisSquare = {
          thisRow: playerRow,
          thisColumn: parseInt(playerColumn) + i,
        }
        traversedSquares.push(thisSquare)
      }
    }
    isBlocked = checkTraversedSquares(traversedSquares)
    return isBlocked;
  } else {
    console.log('moving incorrectly: more than 3 squares or diagonally')
  }
}
// checks if squares in traversedSquares array have class blocked
function checkTraversedSquares(traversedSquares) {
  let isBlocked = true
  for (let i = 0; i < traversedSquares.length; i++) {
    if ($(`[data-row= "${traversedSquares[i].thisRow}"][data-column="${traversedSquares[i].thisColumn}"]`).hasClass('blocked')) {
      isBlocked = false
      return isBlocked
    }
  }
  return isBlocked
}

// switches the activePlayer
function switchPlayers() {
  if (game.activePlayer === playerOne) {
    game.activePlayer = playerTwo
    showWay()
    $('.js-playerTwo_fight').addClass('active')
    $('.js-playerOne_fight').removeClass('active')

  } else {
    game.activePlayer = playerOne
    showWay()
    $('.js-playerOne_fight').addClass('active')
    $('.js-playerTwo_fight').removeClass('active')
  }
}

// shows possible moves to players
function showWay() {
  let currentRow = parseInt(game.activePlayer.position.row)
  let currentColumn = parseInt(game.activePlayer.position.column)

  showWaySouth(currentRow, currentColumn)
  showWayEast(currentRow, currentColumn)
  showWayNorth(currentRow, currentColumn)
  showWayWest(currentRow, currentColumn)
}

// show way north
function showWayNorth(currentRow, currentColumn) {
  for (let i = 1; i <= 3; i++) {
    let node = $(`[data-row= "${currentRow - i}"][data-column="${currentColumn}"]`)
    let nodeCheck = node.hasClass('blocked')

    if (!nodeCheck) {
      if (node.hasClass('playerOne') || node.hasClass('playerTwo')) {
        // jump to next step
      } else {
        node.addClass('possible')
      }
    } else {
      // return out of for loop
      break;
    }
  }
}

// // show way south
function showWaySouth(currentRow, currentColumn) {
  for (let i = 1; i <= 3; i++) {
    let node = $(`[data-row= "${currentRow + i}"][data-column="${currentColumn}"]`)
    let nodeCheck = node.hasClass('blocked')

    if (!nodeCheck) {
      if (node.hasClass('playerOne') || node.hasClass('playerTwo')) {
        // jump to next step
      } else {
        node.addClass('possible')
      }
    } else {
      // return out of for loop
      break;
    }
  }
}

// show way east
function showWayEast(currentRow, currentColumn) {
  for (let i = 1; i <= 3; i++) {
    let node = $(`[data-row= "${currentRow}"][data-column="${currentColumn + i}"]`)
    let nodeCheck = node.hasClass('blocked')

    if (!nodeCheck) {
      if (node.hasClass('playerOne') || node.hasClass('playerTwo')) {
        // jump to next step
      } else {
        node.addClass('possible')
      }
    } else {
      // return out of for loop
      break;
    }
  }
}

// // show way west
function showWayWest(currentRow, currentColumn) {

  for (let i = 1; i <= 3; i++) {
    let node = $(`[data-row= "${currentRow}"][data-column="${currentColumn - i}"]`)
    let nodeCheck = node.hasClass('blocked')

    if (!nodeCheck) {
      if (node.hasClass('playerOne') || node.hasClass('playerTwo')) {
        // jump to next step
      } else {
        node.addClass('possible')
      }
    } else {
      // return out of for loop
      break;
    }
  }
}

// add Eventlistener to grid-container once document is ready
// function start() {
//   $('.js-start-game').on('click', function () {
//     $('.opener').addClass('hidden')
//     game.renderBoard()
//     $('.grid-container').on('click', '.grid-item', function () {
//       game.movePlayer($(this))
//     })
//   })
// }

$(document).ready(function(){
  game.renderBoard()
    $('.grid-container').on('click', '.grid-item', function () {
      game.movePlayer($(this))
    })
})

// $(start)