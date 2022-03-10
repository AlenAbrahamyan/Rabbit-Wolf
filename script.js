const container = document.getElementById("container")
const Y = 0, X = 1;

const configInfo = {
    matrixState : [], 
    mapSize: 0, 
    wolfCount: 0, 
    wallCount: 0, 
    gameInProcess: false
}

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

const fillMatrix = (mapSize) => {
    var matrix = [];
    for (let y = 0; y < mapSize; y++) {
        matrix[y] = [];
        for (let x = 0; x < mapSize; x++) {
            matrix[y][x] = freeSpace;
        }
    }
    return matrix;
}

const setConfig = () => {
    configInfo.mapSize = document.getElementById('mapSizeSelector').value;
    configInfo.wolfCount = configInfo.mapSize - Math.floor(configInfo.mapSize / 2)
    configInfo.wallCount = configInfo.mapSize - Math.floor(configInfo.mapSize / 2)
    configInfo.matrixState = fillMatrix(configInfo.mapSize)
}



const randomFreePosition = () => {
    const xRandom = Math.floor(Math.random() * configInfo.mapSize)
    const yRandom = Math.floor(Math.random() * configInfo.mapSize)

    if (configInfo.matrixState[yRandom][xRandom] === freeSpace) {
        return [yRandom, xRandom]
    } else {
        return randomFreePosition()
    }
}

const setCharacter = (character) => {
    const initialPosition = randomFreePosition();
    configInfo.matrixState[initialPosition[Y]][initialPosition[X]] = character;
}

const setCharacters = (character, count) => {
    for (let i = 0; i < count; i++) {
        setCharacter(character)
    }
}

const setCharactersInitialPositions = () => {
    setCharacters(rabbit, 1)
    setCharacters(home, 1)
    setCharacters(wolf, configInfo.wolfCount)
    setCharacters(wall, configInfo.wallCount)
}

const matrixToDisplay = (matrix) => {
    container.innerHTML = "";

    for (let y = 0; y < configInfo.mapSize; y++) {
        const line = document.createElement('tr');

        for (let x = 0; x < configInfo.mapSize; x++) {
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

const checkLoseOrWin = (position1, position2) => {
    if (configInfo.gameInProcess) {
        if (configInfo.matrixState[position1[Y]][position1[X]] == rabbit && configInfo.matrixState[position2[Y]][position2[X]] == home) {
            configInfo.gameInProcess = false;
            container.innerHTML = '<h2 class="winGame">!!!YOU WIN!!!</h2>';

        } else if (configInfo.matrixState[position1[Y]][position1[X]] == rabbit && configInfo.matrixState[position2[Y]][position2[X]] == wolf) {
            configInfo.gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';

        } else if (configInfo.matrixState[position1[Y]][position1[X]] == wolf && configInfo.matrixState[position2[Y]][position2[X]] == rabbit) {
            configInfo.gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';
        }
    }
}

const getCharactersPosition = (character, matrix) => {
    let charactersPosition = []
    for (let y = 0; y < configInfo.mapSize; y++) {
        for (let x = 0; x < configInfo.mapSize; x++) {
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

const characterStep = (intalPosition, nextPosition) => {
    checkLoseOrWin(intalPosition, nextPosition)
    configInfo.matrixState[nextPosition[Y]][nextPosition[X]] = (configInfo.matrixState[intalPosition[Y]][intalPosition[X]])
    configInfo.matrixState[intalPosition[Y]][intalPosition[X]] = freeSpace
    
    if (configInfo.gameInProcess) {
        matrixToDisplay(configInfo.matrixState)
    }
}

const rabbitTeleportation = (newY, newX) => {
    if (newY == configInfo.mapSize) {
        newY = 0
    } else if (newY == -1) {
        newY = configInfo.mapSize - 1
    }
    if (newX == configInfo.mapSize) {
        newX = 0
    } else if (newX == -1) {
        newX = configInfo.mapSize - 1
    }
    return [newY, newX]
}


const rabbitMovie = (newPosition) =>{
    const currentPosition = getCharactersPosition(rabbit, configInfo.matrixState)
    newPosition = rabbitTeleportation(currentPosition[Y]+newPosition[Y], currentPosition[X]+newPosition[X]);

    for (let i = 0; i < rabbit.possibleSteps.length; i++) {
        if (configInfo.matrixState[newPosition[Y]][newPosition[X]] == rabbit.possibleSteps[i]) {
            characterStep(currentPosition, newPosition) 
            moveWolves()
        }
    }
}

const pythagorasFromRabbit = (wolfPossiblePositions) => {

    const rabbitPosition = getCharactersPosition(rabbit, configInfo.matrixState)
    const pythagoras = wolfPossiblePositions.map(position => {
        return Math.sqrt(Math.pow(position[Y] - rabbitPosition[Y], 2) + Math.pow(position[X] - rabbitPosition[X], 2))
    })

    return pythagoras
}

const wolfPossiblePositions = (wolfPositions) => {
    const possiblePositions = []

    wolfPositions.forEach(wolfPosition => {

        for (let i = 0; i < wolf.possibleSteps.length; i++) {
            if (configInfo.matrixState[wolfPosition[Y]][wolfPosition[X]] == wolf.possibleSteps[i]) {
                possiblePositions.push(wolfPosition)
            }
        }
    })
    return possiblePositions;
}

const mathWithPositions = (wolfPosition) => {return [
    [wolfPosition[Y] - 1, wolfPosition[X]],
    [wolfPosition[Y] + 1, wolfPosition[X]],
    [wolfPosition[Y], wolfPosition[X] + 1],
    [wolfPosition[Y], wolfPosition[X] - 1],
]}

const wolfneighbourPositions = (wolfPosition) => {

    const mathWithPosition =  mathWithPositions(wolfPosition);

    const neighbourPositions = mathWithPosition.filter((position) => {
        return position[Y] >= 0 && position[Y] < configInfo.mapSize && position[X] >= 0 && position[X] < configInfo.mapSize
    });

    return wolfPossiblePositions(neighbourPositions)

}

const getShortestDistancePosition = (neighbourPositions, wolfPosition) => {
    const pythagoras = pythagorasFromRabbit(wolfneighbourPositions(wolfPosition))

    let shortestIndex = 0;

    for (let i = 0; i < pythagoras.length; i++) {
        if (pythagoras[i] < pythagoras[shortestIndex]) {
            shortestIndex = i;
        }
    }

    return neighbourPositions[shortestIndex]
}

const moveWolves = () => {
    const wolves = getCharactersPosition(wolf, configInfo.matrixState)

    wolves.map(wolfPosition => {
        const neighbourPositions = wolfneighbourPositions(wolfPosition)
        const shortestDistancePosition = getShortestDistancePosition(neighbourPositions, wolfPosition)
        characterStep(wolfPosition, shortestDistancePosition)
    })
}

window.addEventListener("keyup", event => {
    if (configInfo.gameInProcess) {
        if (event.key === "ArrowUp") {
            rabbitMovie([-1, 0])
        }
        else if (event.key === "ArrowDown") {
            rabbitMovie([1, 0])
        }
        else if (event.key === "ArrowRight") {
            rabbitMovie([0, 1])
        }
        else if (event.key === "ArrowLeft") {
            rabbitMovie([0, -1])
        }
        
    }
})


const startGame = () => {
    configInfo.gameInProcess = true
    setConfig()
    setCharactersInitialPositions()
    matrixToDisplay(configInfo.matrixState)
}
