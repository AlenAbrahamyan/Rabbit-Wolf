const container = document.getElementById("container")
const Y=0, X=1

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

const createConfig = () => {
    const info = {
        mapSize: 0,
        wolfCount: 0,
        wallCount:0,
        gameInProcess: false
    }
    
    const setInfo = (selectedMapSize) =>{
        info.mapSize = selectedMapSize
        info.wolfCount = selectedMapSize - Math.floor(selectedMapSize / 2)
        info.wallCount = Math.floor(selectedMapSize / 2)
    }

    const startGameProcess = () =>{
        info.gameInProcess = true
    }

    const stopGameProcess = () => {
        info.gameInProcess = false
    }

    return {
        info,
        setInfo,
        startGameProcess,
        stopGameProcess
    }
}

const createMatrix = () => {
    let state = []

    const fillMatrix = () => {
        for (let y = 0; y < config.info.mapSize; y++) {
            state[y] = [];
            for (let x = 0; x < config.info.mapSize; x++) {
                state[y][x] = freeSpace;
            }
        }
    }

    const removeElement = (position) => {
        state[position[Y]][position[X]] = 0
    }

    const setElement = (element, position) => {
        state[position[Y]][position[X]] = element
    }

    const getCharactersPosition = (character) => {
        let charactersPosition = []
        for (let y = 0; y < config.info.mapSize; y++) {
            for (let x = 0; x < config.info.mapSize; x++) {
                if (state[y][x] == character) {
                    charactersPosition.push([y, x])
                }
            }
        }
        if (charactersPosition.length == 1) {
            return charactersPosition[0]
        }
        return charactersPosition
    }

    const toDisplay = () => {
        container.innerHTML = "";
    
        for (let y = 0; y < config.info.mapSize; y++) {
            const line = document.createElement('tr');
    
            for (let x = 0; x < config.info.mapSize; x++) {
                const item = document.createElement('td');
    
                if (matrix.state[y][x] != freeSpace) {
                    const imageUrl = matrix.state[y][x].img
                    let image = document.createElement('img');
                    image.src = imageUrl;
                    image.setAttribute("class", "charImg")
                    item.appendChild(image);
                }
                line.appendChild(item)
            }
            container.appendChild(line);
        }
    }

    return {
        state,
        fillMatrix,
        toDisplay,
        setElement,
        removeElement,
        getCharactersPosition
    }

}

const config = createConfig()
const matrix = createMatrix()

const randomFreePosition = () => {
    const xRandom = Math.floor(Math.random() * config.info.mapSize)
    const yRandom = Math.floor(Math.random() * config.info.mapSize)

    if (matrix.state[yRandom][xRandom] === freeSpace) {
        return [yRandom, xRandom]
    }
    return randomFreePosition()
}

const setElementInitialPosition = (character) =>{
    const initialPosition = randomFreePosition()
    matrix.setElement(character, initialPosition)
}

const setElementsInitialPositions = (character, count) => {
    for (let i = 0; i < count; i++) {
        setElementInitialPosition(character)
    }
}

const setMatrixInitialPositions = () => {
    setElementInitialPosition(rabbit)
    setElementInitialPosition(home)
    setElementsInitialPositions(wolf, config.info.wolfCount)
    setElementsInitialPositions(wall, config.info.wallCount)
}

const characterStep = (intalPosition, nextPosition) => {
    checkLoseOrWin(intalPosition, nextPosition)
    const element = matrix.state[intalPosition[Y]][intalPosition[X]]
    matrix.setElement(element, nextPosition)
    matrix.removeElement(intalPosition)
    
    if (config.info.gameInProcess) {
        matrix.toDisplay()
    }
}

const checkLoseOrWin = (position1, position2) => {
    if (config.info.gameInProcess) {
        if (matrix.state[position1[Y]][position1[X]] == rabbit && matrix.state[position2[Y]][position2[X]] == home) {
            config.info.gameInProcess = false;
            container.innerHTML = '<h2 class="winGame">!!!YOU WIN!!!</h2>';

        } else if (matrix.state[position1[Y]][position1[X]] == rabbit && matrix.state[position2[Y]][position2[X]] == wolf) {
            config.info.gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';

        } else if (matrix.state[position1[Y]][position1[X]] == wolf && matrix.state[position2[Y]][position2[X]] == rabbit) {
            config.info.gameInProcess = false;
            container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';
        }
    }
}

const rabbitTeleportation = (newPosition) => {
    if (newPosition[Y] == config.info.mapSize) {
        newPosition[Y] = 0
    } else if (newPosition[Y] == -1) {
        newPosition[Y] = config.info.mapSize - 1
    }
    if (newPosition[X] == config.info.mapSize) {
        newPosition[X] = 0
    } else if (newPosition[X] == -1) {
        newPosition[X] = config.info.mapSize - 1
    }
    return [newPosition[Y], newPosition[X]]
}

const compose = (...funcs) => {
    if (funcs.length === 0) {
      return arg => arg;
    }
  
    if (funcs.length === 1) {
      return funcs[0];
    }

    const lastFn = funcs[funcs.length - 1];
    const withoutLastFn = funcs.slice(0, funcs.length - 1);
    return (...args) => compose(...withoutLastFn)(lastFn(...args));
}


const wolfNeighbourPositions = (wolfPosition) => {return [
    [wolfPosition[Y] - 1, wolfPosition[X]],
    [wolfPosition[Y] + 1, wolfPosition[X]],
    [wolfPosition[Y], wolfPosition[X] + 1],
    [wolfPosition[Y], wolfPosition[X] - 1]
]}

const filterOutOfMatrixPositions = (neighbourPositions) => {
    return neighbourPositions.filter((position) => {
        return position[Y] >= 0 && position[Y] < config.info.mapSize && position[X] >= 0 && position[X] < config.info.mapSize
    });
}

const wolfPossiblePositions = (filteredOutOfMatrixPositions) =>{
    const possiblePositions = []

    filteredOutOfMatrixPositions.forEach(wolfPosition => {
        for (let i = 0; i < wolf.possibleSteps.length; i++) {
            if (matrix.state[wolfPosition[Y]][wolfPosition[X]] == wolf.possibleSteps[i]) {
                possiblePositions.push(wolfPosition)
            }
        }
    })
    return possiblePositions;
}

const calculateDistanceFromRabbit = (possiblePositions) => {
    const rabbitPosition = matrix.getCharactersPosition(rabbit)
    const distancesFromRabbit = possiblePositions.map(position => {
        return Math.sqrt(Math.pow(position[Y] - rabbitPosition[Y], 2) + Math.pow(position[X] - rabbitPosition[X], 2))
    })

    return {
        distancesFromRabbit,
        possiblePositions
    }
}

const chooseShortestDistanceFromRabbit = (info) =>{
    let minIndex = 0
    for(let i = 0; i<info.distancesFromRabbit.length; i++){
        if(info.distancesFromRabbit[minIndex] > info.distancesFromRabbit[i]){
            minIndex = i
        }
    }

    return info.possiblePositions[minIndex]
}

const wolfMovie = compose(chooseShortestDistanceFromRabbit, calculateDistanceFromRabbit, wolfPossiblePositions, filterOutOfMatrixPositions, wolfNeighbourPositions)

const moveWolves = () => {
    const wolves = matrix.getCharactersPosition(wolf)
    wolves.forEach(wolfPosition => {
        const nextPosition = wolfMovie(wolfPosition)
        characterStep(wolfPosition, nextPosition)
    })
}

const rabbitMovie = (newPosition) =>{
    const currentPosition = matrix.getCharactersPosition(rabbit)
    newPosition = rabbitTeleportation([currentPosition[Y]+newPosition[Y], currentPosition[X]+newPosition[X]]);
    for (let i = 0; i < rabbit.possibleSteps.length; i++) {
        if (matrix.state[newPosition[Y]][newPosition[X]] == rabbit.possibleSteps[i]) {
            characterStep(currentPosition, newPosition) 
            moveWolves()
        }
    }
}

window.addEventListener("keyup", event => {
    if (config.info.gameInProcess) {
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
    config.setInfo(document.getElementById('mapSizeSelector').value)
    config.startGameProcess()
    matrix.fillMatrix()
    setMatrixInitialPositions()
    matrix.toDisplay()

}
