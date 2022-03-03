const container = document.getElementById("container")
const Y = 0, X = 1;
var matrixState = [], mapSize, wolfCount, wallCount, gameInProcess = false;


const freeSpace = 0

const wall = {
    name: "wall",
    img: "images/wall.png"
}

const home = {
    name: "home",
    img: "images/home.png"
}

const rabbit = {
    name: "rabbit",
    img: "images/rabbit.png",
    possibleSteps: []
}

const wolf = {
    name: "wolf",
    img: "images/wolf.png",
    possibleSteps: []
}


rabbit.possibleSteps.push(freeSpace, wolf, home)
wolf.possibleSteps.push(rabbit, freeSpace)

function fillMatrix(mapSize) {
    var matrix = [];
    for (let y = 0; y < mapSize; y++) {
        matrix[y] = [];
        for (let x = 0; x < mapSize; x++) {
            matrix[y][x] = freeSpace;
        }
    }
    return matrix;
}

function setConfig() {
    mapSize = document.getElementById('mapSizeSelector').value;
    wolfCount = mapSize - Math.floor(mapSize / 2)
    wallCount = mapSize - Math.floor(mapSize / 2)
    matrixState = fillMatrix(mapSize)
}

function randomFreePosition() {
    const xRandom = Math.floor(Math.random() * mapSize)
    const yRandom = Math.floor(Math.random() * mapSize)

    if (matrixState[yRandom][xRandom] === freeSpace) {
        return [yRandom, xRandom]
    } else {
        return randomFreePosition()
    }
}

function setCharacter(character) {
    const initialPosition = randomFreePosition();
    matrixState[initialPosition[Y]][initialPosition[X]] = character;
}

function setCharacters(character, count) {
    for (let i = 0; i < count; i++) {
        setCharacter(character)
    }
}

function setCharactersInitialPositions() {
    setCharacters(rabbit, 1)
    setCharacters(home, 1)
    setCharacters(wolf, wolfCount)
    setCharacters(wall, wallCount)
}

function matrixToDisplay(matrix) {
    container.innerHTML = "";

    for (let y = 0; y < mapSize; y++) {
        const line = document.createElement('tr');

        for (let x = 0; x < mapSize; x++) {
            const item = document.createElement('td');

            if (matrix[y][x] != freeSpace) {
                const imageUrl = matrix[y][x].img
                var image = document.createElement('img');
                image.src = imageUrl;
                image.setAttribute("class", "charImg")
                item.appendChild(image);
            }
            line.appendChild(item)
        }
        container.appendChild(line);
    }
}

function checkLoseOrWin(position1, position2) {
    if (gameInProcess) {
        if (matrixState[position1[Y]][position1[X]] == rabbit && matrixState[position2[Y]][position2[X]] == home) {
            gameInProcess = false;
            container.innerHTML = '<h2 class="winGame">!!!YOU WIN!!!</h2>';

        } else if (matrixState[position1[Y]][position1[X]] == rabbit && matrixState[position2[Y]][position2[X]] == wolf) {
            gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';

        } else if (matrixState[position1[Y]][position1[X]] == wolf && matrixState[position2[Y]][position2[X]] == rabbit) {
            gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';
        }
    }
}

function getCharactersPosition(character, matrix) {
    let charactersPosition = []
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (matrix[y][x] == character) {
                charactersPosition.push([y, x])
            }
        }
    }
    if (charactersPosition.length == 1) {
        return charactersPosition[0]
    }
    return charactersPosition
}

function rabbitTeleportation(newY, newX) {
    if (newY == mapSize) {
        newY = 0
    } else if (newY == -1) {
        newY = mapSize - 1
    }
    if (newX == mapSize) {
        newX = 0
    } else if (newX == -1) {
        newX = mapSize - 1
    }
    return [newY, newX]
}

function characterStep(intalPosition, nextPosition) {
    checkLoseOrWin(intalPosition, nextPosition)
    matrixState[nextPosition[Y]][nextPosition[X]] = (matrixState[intalPosition[Y]][intalPosition[X]])
    matrixState[intalPosition[Y]][intalPosition[X]] = freeSpace

    if (gameInProcess) {
        matrixToDisplay(matrixState)
    }
}

function charactersStep(character, currentPosition, newPosition) {
    if (character == rabbit) {
        const checkTeleportation = rabbitTeleportation(newPosition[Y], newPosition[X]);

        newPosition[Y] = checkTeleportation[Y]
        newPosition[X] = checkTeleportation[X]
    }

    for (let i = 0; i < character.possibleSteps.length; i++) {
        if (matrixState[newPosition[Y]][newPosition[X]] == character.possibleSteps[i]) {
            characterStep(currentPosition, newPosition)
            return newPosition
        }
    }
}

function pythagorasFromRabbit(wolfPossiblePositions) {

    const rabbitPosition = getCharactersPosition(rabbit, matrixState)
    const pythagoras = wolfPossiblePositions.map(position => {
        return Math.sqrt(Math.pow(position[Y] - rabbitPosition[Y], 2) + Math.pow(position[X] - rabbitPosition[X], 2))
    })

    return pythagoras
}

function wolfPossiblePositions(wolfPositions) {
    const possiblePositions = []

    wolfPositions.map(wolfPosition => {

        for (let i = 0; i < wolf.possibleSteps.length; i++) {
            if (matrixState[wolfPosition[Y]][wolfPosition[X]] == wolf.possibleSteps[i]) {
                possiblePositions.push(wolfPosition)
            }
        }
    })
    return possiblePositions;
}

function wolfneighbourPositions(wolfPosition) {

    const mathWithPositions = [
        [wolfPosition[Y] - 1, wolfPosition[X]],
        [wolfPosition[Y] + 1, wolfPosition[X]],
        [wolfPosition[Y], wolfPosition[X] + 1],
        [wolfPosition[Y], wolfPosition[X] - 1],
    ]

    const neighbourPositions = mathWithPositions.filter((position) => {
        return position[Y] >= 0 && position[Y] < mapSize && position[X] >= 0 && position[X] < mapSize
    });

    return wolfPossiblePositions(neighbourPositions)

}

function getShortestDistancePosition(neighbourPositions, wolfPosition) {
    const pythagoras = pythagorasFromRabbit(wolfneighbourPositions(wolfPosition))

    let shortestIndex = 0;

    for (let i = 0; i < pythagoras.length; i++) {
        if (pythagoras[i] < pythagoras[shortestIndex]) {
            shortestIndex = i;
        }
    }

    return neighbourPositions[shortestIndex]
}

function moveWolves() {
    const wolves = getCharactersPosition(wolf, matrixState)

    wolves.map(wolfPosition => {
        const neighbourPositions = wolfneighbourPositions(wolfPosition)
        const shortestDistancePosition = getShortestDistancePosition(neighbourPositions, wolfPosition)
        charactersStep(wolf, wolfPosition, shortestDistancePosition)
    })
}

window.addEventListener("keyup", event => {
    if (gameInProcess) {

        const rabbitPosition = getCharactersPosition(rabbit, matrixState)

        if (event.key === "ArrowUp") {
            charactersStep(rabbit, rabbitPosition, [rabbitPosition[Y] - 1, rabbitPosition[X]])
            moveWolves()
        }
        else if (event.key === "ArrowDown") {
            charactersStep(rabbit, rabbitPosition, [rabbitPosition[Y] + 1, rabbitPosition[X]])
            moveWolves()
        }
        else if (event.key === "ArrowRight") {
            charactersStep(rabbit, rabbitPosition, [rabbitPosition[Y], rabbitPosition[X] + 1])
            moveWolves()
        }
        else if (event.key === "ArrowLeft") {
            charactersStep(rabbit, rabbitPosition, [rabbitPosition[Y], rabbitPosition[X] - 1])
            moveWolves()
        }
    }
})


function startGame() {
    gameInProcess = true
    setConfig()
    setCharactersInitialPositions()
    matrixToDisplay(matrixState)
}
