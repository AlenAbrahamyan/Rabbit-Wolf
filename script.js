const Y = 0, X = 1
const FREE_SPACE = 0, RABBIT = 1, WOLF = 2, WALL = 3, HOME = 4

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


const neighbourPositions = (coord) => {
    return [
        [coord[Y] - 1, coord[X]],
        [coord[Y] + 1, coord[X]],
        [coord[Y], coord[X] + 1],
        [coord[Y], coord[X] - 1]
    ]
}


const marginalTeleportation = (mapSize, newPosition) => {
    if (newPosition[Y] === mapSize) {
        newPosition[Y] = 0
    } else if (newPosition[Y] === -1) {
        newPosition[Y] = mapSize - 1
    }
    if (newPosition[X] === mapSize) {
        newPosition[X] = 0
    } else if (newPosition[X] === -1) {
        newPosition[X] = mapSize - 1
    }
    return [newPosition[Y], newPosition[X]]
}


const createConfig = (selectedMapSize) => {
    const info = {
        mapSize: selectedMapSize * 1,
        wolfCount: selectedMapSize - Math.floor(selectedMapSize / 2),
        wallCount: Math.floor(selectedMapSize / 2),
        gameInProcess: false
    }

    const startGameProcess = () => {
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

    const filterOutOfMatrixPositions = (neighbourPositions) => {
        const filteredOutOfMatrixPositions = neighbourPositions.filter((position) => {
            return position[Y] >= 0 && position[Y] < config.info.mapSize && position[X] >= 0 && position[X] < config.info.mapSize
        });

        return filteredOutOfMatrixPositions

    }

    const wolfPossiblePositions = (filteredOutOfMatrixPositions) => {
        return filteredOutOfMatrixPositions.filter(([x, y]) => {
            return CHARACTERS[WOLF].possibleSteps.includes(state[x][y])
        })
    }

    const calcDistance = (a) => (b) =>
        Math.sqrt(Math.pow(a[Y] - b[Y], 2) + Math.pow(a[X] - b[X], 2))


    const calculateDistanceFromRabbit = (possiblePositions) => {
        const rabbitPosition = getCharactersPosition(RABBIT)[0]
        const distancesFromRabbit = possiblePositions.map(wolfPossiblePosition => calcDistance(wolfPossiblePosition)(rabbitPosition))
        return {
            distancesFromRabbit: distancesFromRabbit,
            possiblePositions: possiblePositions
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
        neighbourPositions)

    const moveWolves = () => {
        getCharactersPosition(WOLF)
            .forEach(_wolf => {
                if (config.info.gameInProcess) {
                    characterStep(_wolf, calcWolfNextStep(_wolf))
                }
            })
    }

    const rabbitMove = (newPosition) => {
        const currentPosition = getCharactersPosition(RABBIT)[0]
        newPosition = marginalTeleportation(config.info.mapSize, [currentPosition[Y] + newPosition[Y], currentPosition[X] + newPosition[X]]);
        for (let i = 0; i < CHARACTERS[RABBIT].possibleSteps.length; i++) {
            if (state[newPosition[Y]][newPosition[X]] == CHARACTERS[RABBIT].possibleSteps[i]) {
                characterStep(currentPosition, newPosition)
                moveWolves()
            }
        }
    }

    const reactToEvents = (direction) => {
        if (config.info.gameInProcess === false) {
            return false
        }
        if (direction === "ArrowUp") {
            rabbitMove([-1, 0])
        } else if (direction === "ArrowDown") {
            rabbitMove([1, 0])
        } else if (direction === "ArrowRight") {
            rabbitMove([0, 1])
        } else if (direction === "ArrowLeft") {
            rabbitMove([0, -1])
        }
    }

    window.addEventListener("keyup", event => {
        reactToEvents(event.key)
    })

    const startGame = () => {
        config.startGameProcess()
        fillMatrix()
        setMatrixInitialPositions()
        toDisplay()
    }

    startGame()

    return {
        config,
        state
    }
}


const startGame = () => {
    const selectedMapSize = document.getElementById('mapSizeSelector').value
    const containerAdress = document.getElementById("container")
    createMatrix(createConfig(selectedMapSize), containerAdress)

}
