const Y = 0, X = 1
const FREE_SPACE = 0
const RABBIT = 1
const WOLF = 2
const WALL = 3
const HOME = 4

const CHARACTERS = {
    [RABBIT]: {
        name: "rabbit",
        img: "images/rabbit.png",
        possibleSteps: [FREE_SPACE, WOLF, HOME]
    },
    [WOLF]: {
        name: "wolf",
        img: "images/wolf.png",
        possibleSteps: [RABBIT, FREE_SPACE]
    },
    [WALL]: {
        name: "wall",
        img: "images/wall.png"
    },
    [HOME]: {
        name: "home",
        img: "images/home.png"
    }
}

const createConfig = (selectedMapSize) => {
    const info = {
        mapSize: selectedMapSize*1,
        wolfCount: selectedMapSize - Math.floor(selectedMapSize / 2),
        wallCount: Math.floor(selectedMapSize / 2),
        gameInProcess: false
    }

    const startGameProcess = () =>{
        info.gameInProcess = true
    }

    const stopGameProcess = () => {
        info.gameInProcess = false
    }

    return {
        info,
        startGameProcess,
        stopGameProcess
    }
}


const createMatrix = (_config, containerAdress) => {
    const container = containerAdress
    const config = _config
    let state = []

    const fillMatrix = () => {
        for (let y = 0; y < config.info.mapSize; y++) {
            state[y] = [];
            for (let x = 0; x < config.info.mapSize; x++) {
                state[y][x] = FREE_SPACE;
            }
        }
    }

    const randomFreePosition = () => {
        const xRandom = Math.floor(Math.random() * config.info.mapSize)
        const yRandom = Math.floor(Math.random() * config.info.mapSize)
    
        if (state[yRandom][xRandom] === FREE_SPACE) {
            return [yRandom, xRandom]
        }
        return randomFreePosition()
    }

    const setElement = (element) => (position) => {
        state[position[Y]][position[X]] = element
    }

    const removeElement = setElement(FREE_SPACE)

    const getCharactersPosition = (character) => {
        let charactersPosition = []
        for (let y = 0; y < config.info.mapSize; y++) {
            for (let x = 0; x < config.info.mapSize; x++) {
                if (state[y][x] === character) {
                    charactersPosition.push([y, x])
                }
            }
        }
        return charactersPosition
    }

    const toDisplay = () => {
        container.innerHTML = ''
    
        for (let y = 0; y < config.info.mapSize; y++) {
            const line = document.createElement('tr');
    
            for (let x = 0; x < config.info.mapSize; x++) {
                const item = document.createElement('td');
    
                if (state[y][x] != FREE_SPACE) {
                    const imageUrl = CHARACTERS[state[y][x]].img
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

    const setElementInitialPosition = (character) => setElement(character)(randomFreePosition())

    const setElementsInitialPositions = (character, count) => {
        for (let i = 0; i < count; i++) {
            setElementInitialPosition(character)
        }
    }
    
    const checkLoseOrWin = (_intalPosition, _nextPosition) => {
        if (config.info.gameInProcess) {
            const initialPosition = state[_intalPosition[Y]][_intalPosition[X]]
            const nextPosition = state[_nextPosition[Y]][_nextPosition[X]]
            
            if (initialPosition === RABBIT && nextPosition === HOME) {
                config.stopGameProcess()
                container.innerHTML = '<h2 class="winGame">!!!YOU WIN!!!</h2>';
            } else if (
                (initialPosition === RABBIT && nextPosition === WOLF)
                ||
                (initialPosition === WOLF && nextPosition === RABBIT)
            ) {
                config.stopGameProcess()
                container.innerHTML = '<h2 class="loseGame">!!!YOU LOSE!!!</h1>';
            }
        }
    }

    const setMatrixInitialPositions = () => {
        setElementInitialPosition(RABBIT)
        setElementInitialPosition(HOME)
        setElementsInitialPositions(WOLF, config.info.wolfCount)
        setElementsInitialPositions(WALL, config.info.wallCount)
    }

    const characterStep = (intalPosition, nextPosition) => {
        checkLoseOrWin(intalPosition, nextPosition)
        const character = state[intalPosition[Y]][intalPosition[X]]
        setElement(character)(nextPosition)
        removeElement(intalPosition)
    
        if (config.info.gameInProcess) {
            toDisplay()
        }
    }

    return {
        config,
        state,
        fillMatrix,
        randomFreePosition,
        toDisplay,
        setElement,
        removeElement,
        getCharactersPosition,
        setElementInitialPosition,
        setElementsInitialPositions,
        checkLoseOrWin,
        setMatrixInitialPositions,
        characterStep
    }
}

const rabbitTeleportation = (_matrix, newPosition) => {
    if (newPosition[Y] === _matrix.config.info.mapSize) {
        newPosition[Y] = 0
    } else if (newPosition[Y] === -1) {
        newPosition[Y] = _matrix.config.info.mapSize - 1
    }
    if (newPosition[X] === _matrix.config.info.mapSize) {
        newPosition[X] = 0
    } else if (newPosition[X] === -1) {
        newPosition[X] = _matrix.config.info.mapSize - 1
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


const wolfNeighbourPositions = (wolfPosition, _matrix) => {
    return {
        neighbourPositions: [
            [wolfPosition[Y] - 1, wolfPosition[X]],
            [wolfPosition[Y] + 1, wolfPosition[X]],
            [wolfPosition[Y], wolfPosition[X] + 1],
            [wolfPosition[Y], wolfPosition[X] - 1]],
         _matrix: _matrix
        }
}

const filterOutOfMatrixPositions = (info) => {
const filteredOutOfMatrixPositions = info.neighbourPositions.filter((position) => {
        return position[Y] >= 0 && position[Y] < info._matrix.config.info.mapSize && position[X] >= 0 && position[X] < info._matrix.config.info.mapSize
    });

    return{
        filteredOutOfMatrixPositions: filteredOutOfMatrixPositions,
        _matrix: info._matrix
    }
}

const wolfPossiblePositions = (info) => {
    const possiblePositions = info.filteredOutOfMatrixPositions.filter(wolfPosition => {
        for (let i = 0; i < CHARACTERS[WOLF].possibleSteps.length; i++) {
            if (info._matrix.state[wolfPosition[Y]][wolfPosition[X]] === CHARACTERS[WOLF].possibleSteps[i]) {
                return true
            } 
        }
    })

    return{
        possiblePositions,
        _matrix: info._matrix
    }
}

const calcDistance = (a) => (b) =>
    Math.sqrt(Math.pow(a[Y] - b[Y], 2) + Math.pow(a[X] - b[X], 2))


const calculateDistanceFromRabbit = (info) => {
        const rabbitPosition = info._matrix.getCharactersPosition(RABBIT)[0]
        const distancesFromRabbit = info.possiblePositions.map( wolfPossiblePosition => calcDistance(wolfPossiblePosition)(rabbitPosition))
        return {
            distancesFromRabbit: distancesFromRabbit,
            possiblePositions: info.possiblePositions,
            _matrix: info._matrix
        }
}

const chooseShortestDistanceFromRabbit = (info) => {
    let minIndex = 0
    for (let i = 0; i < info.distancesFromRabbit.length; i++) {
        if (info.distancesFromRabbit[minIndex] > info.distancesFromRabbit[i]) {
            minIndex = i
        }
    }
    return info.possiblePositions[minIndex] 
}

const calcWolfNextStep = compose(
    chooseShortestDistanceFromRabbit,
    calculateDistanceFromRabbit,
    wolfPossiblePositions,
    filterOutOfMatrixPositions,
    wolfNeighbourPositions)

const moveWolves = (_matrix) => {
    _matrix
        .getCharactersPosition(WOLF)
        .forEach(_wolf => {
            if(_matrix.config.info.gameInProcess){
                _matrix.characterStep(_wolf, calcWolfNextStep(_wolf, _matrix))}
        })
}

const rabbitMove = (_matrix) => (newPosition) => {
    const currentPosition = _matrix.getCharactersPosition(RABBIT)[0]
    newPosition = rabbitTeleportation(_matrix, [currentPosition[Y] + newPosition[Y], currentPosition[X] + newPosition[X]]);
    for (let i = 0; i < CHARACTERS[RABBIT].possibleSteps.length; i++) {
        if (_matrix.state[newPosition[Y]][newPosition[X]] == CHARACTERS[RABBIT].possibleSteps[i]) {
            _matrix.characterStep(currentPosition, newPosition)
            moveWolves(_matrix)
        }
    }
}

const startGame = () => {
    const selectedMapSize = document.getElementById('mapSizeSelector').value
    const containerAdress = document.getElementById("container")
    const matrix = createMatrix(createConfig(selectedMapSize), containerAdress)
    
    matrix.config.startGameProcess()
    matrix.fillMatrix()
    matrix.setMatrixInitialPositions()
    matrix.toDisplay()

    
    window.addEventListener("keyup", event => {
       
        if (matrix.config.info.gameInProcess 
                && 
            (event.key==="ArrowUp" || event.key==="ArrowDown" || event.key==="ArrowRight" || event.key==="ArrowLeft")) {

            const rabbitStep = rabbitMove(matrix)
            if (event.key === "ArrowUp") {
                rabbitStep([-1, 0])
            }
            else if (event.key === "ArrowDown") {
                rabbitStep([1, 0])
            }
            else if (event.key === "ArrowRight") {
                rabbitStep([0, 1])
            }
            else if (event.key === "ArrowLeft") {
                rabbitStep([0, -1])
            }
        }
    })

}
