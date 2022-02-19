const container = document.getElementById("container")
var mapSize, wolfCount, wallCount; 
var mapMatrix = [], rabbitPosition=[] , homePosition = [],  wolfPosition = [], wallPosition = []


//Determines the count of wolfs and the walls depending on the size of the Game Map
function setCountsOfChar(selectedNumber){

    if(selectedNumber==9){
        mapSize=9
        wolfCount=5;
        wallCount=5;
    }else if(selectedNumber==7){
        mapSize=7
        wolfCount=4;
        wallCount=4;
    }else{
        mapSize=5
        wolfCount=3;
        wallCount=3;
    }

}


//Creating Game Map
function mapCreator(size) {

    for (let i = 0; i < size; i++) {
        
        var line = document.createElement('tr');
        mapMatrix[i] = line;
        mapMatrix[i].lenght = size;

        for (let m = 0; m < size; m++) {

            var item = document.createElement('td');
            line.appendChild(item);
            mapMatrix[i][m] = item;

        }

        container.appendChild(line);
    }
}


//Gives the created Charecter position in Game Map
function addCharechter(maxNuber, name, arr) {
   
    var yPosition = Math.floor(Math.random() * maxNuber)
    var xPosition = Math.floor(Math.random() * maxNuber)
    if(mapMatrix[yPosition][xPosition].childNodes.length > 0) {
        return addCharechter(maxNuber, name, arr)
    }
    if(name=='rabbit' || name=='home'){
        arr[0]=yPosition;
        arr[1]=xPosition;

        var image = document.createElement('img');
        image.src = `./images/${name}.png`;
        image.setAttribute("class", "charImg")
        mapMatrix[yPosition][xPosition].appendChild(image);

    }else{
    arr.push([yPosition,xPosition])

    var image = document.createElement('img');
        image.src = `./images/${name}.png`;
        image.setAttribute("class", "charImg")
        mapMatrix[yPosition][xPosition].appendChild(image);
    
    }

}


//Moves the Charecter to the new cube and deletes it from the old cube
function moveCharecter(name, oldData, newData) {
  
    var image = document.createElement('img');
    
    image.src = `./images/${name}.png`;
    image.setAttribute("class", "charImg")
    mapMatrix[newData[0]][newData[1]].appendChild(image);

    mapMatrix[oldData[0]][oldData[1]].innerHTML="<td></td>"
  
}


//We create the characters
//We use it every time when start a new game
function createCharechters () {
  
    addCharechter(mapSize, 'home', homePosition);
    addCharechter(mapSize, 'rabbit', rabbitPosition);

    
    for(let i=0; i<wolfCount; i++){
        addCharechter(mapSize, 'wolf', wolfPosition);
    }
    
    for(let i=0; i<wallCount; i++){
        addCharechter(mapSize, 'wall', wallPosition);
    }
}




//Understands what step we want to take
function rabbitMove(key){

    if(key === "ArrowUp"){
        decideNewPositionForRabbit(-1,0)
    }

    else if(key === "ArrowDown"){
        decideNewPositionForRabbit(1,0)
    }

    else if(key === "ArrowRight"){
        decideNewPositionForRabbit(0,1)
    }

    else if(key === "ArrowLeft"){
        decideNewPositionForRabbit(0,-1)
    }

    
}

window.addEventListener("keyup", event => rabbitMove(event.key))




//New rabbit coordinates
function decideNewPositionForRabbit(y,x){
  
    var newRabbitPosition=[], oldRabbitPosition=[];
   
    newRabbitPosition[0]=rabbitPosition[0]
    newRabbitPosition[1]=rabbitPosition[1]

    oldRabbitPosition[0]=rabbitPosition[0]
    oldRabbitPosition[1]=rabbitPosition[1]

    newRabbitPosition[0] += y;
    newRabbitPosition[1] += x;

    if(newRabbitPosition[0] == mapSize)
        newRabbitPosition[0]=0
    else if(newRabbitPosition[1] == mapSize)
        newRabbitPosition[1]=0
    else if(newRabbitPosition[0] == -1)
        newRabbitPosition[0] = (mapSize-1)
    else if(newRabbitPosition[1] == -1)
        newRabbitPosition[1] = (mapSize-1)
    
        allowStep(newRabbitPosition, oldRabbitPosition)
}




//He does not let the rabbit go to the wall coordinate
function allowStep(newPosition, oldPosition){

    if(mapMatrix[newPosition[0]][newPosition[1]].childNodes[0]){
        if(mapMatrix[newPosition[0]][newPosition[1]].childNodes[0].currentSrc.split('').reverse().join('').slice(4, 8)=='llaw'){
         
        }else{
            rabbitPosition[0]=newPosition[0];
            rabbitPosition[1]=newPosition[1];
            moveCharecter('rabbit', oldPosition, rabbitPosition);
            winGame();
            wolfStep();
            
        }
    }else{
            rabbitPosition[0]=newPosition[0];
            rabbitPosition[1]=newPosition[1];
            moveCharecter('rabbit', oldPosition, rabbitPosition);
            winGame();
            wolfStep();
            
        }
    
}






//Takes the next step of the wolf
function wolfStep(){
   
    var availablePositions = wolfAvailablePositions(wolfNeighborPositions(wolfPosition));
    var index = minDistance(getPythagoras(availablePositions))

    newWolfPosicion = [];
    
    for (let i = 0; i < availablePositions.length; i++) {
        newWolfPosicion.push(availablePositions[i][index[i]]);
    }


    for (let i = 0; i < newWolfPosicion.length; i++) {
        if(mapMatrix[newWolfPosicion[i][0]][newWolfPosicion[i][1]].childNodes[0]){
            if (mapMatrix[newWolfPosicion[i][0]][newWolfPosicion[i][1]].childNodes[0].currentSrc.split('').reverse().join('').slice(4, 8)=='flow') {
                
            }else{
                moveCharecter('wolf', wolfPosition[i], newWolfPosicion[i]);
                wolfPosition[i] = newWolfPosicion[i];
                loseGame();
            }
        }else{
            moveCharecter('wolf', wolfPosition[i], newWolfPosicion[i]);
            wolfPosition[i] = newWolfPosicion[i];
            loseGame();
        }
    }    
}





function wolfNeighborPositions (wolfs){
   
    var neighborPositions = [];
    
    wolfs.map(wolf=>{
       
        neighborPositions.push([
            [ wolf[0]-1, wolf[1] ],
            [ wolf[0]+1, wolf[1] ],
            [ wolf[0], wolf[1]+1 ],
            [ wolf[0], wolf[1]-1 ]
        ])

    });

    return neighborPositions;
}


//We get the Probability coordinates for a wolf
function wolfAvailablePositions(neighborPositions){
    
    var availablePositions = [];

    neighborPositions.map(wolfNeighbors => {
        var thisWolfAvailablePositions = [];
        wolfNeighbors.map(wolfNeighborPos => {
            
            if (wolfNeighborPos[0]==-1 || wolfNeighborPos[1]==-1 || wolfNeighborPos[0]==mapSize || wolfNeighborPos[1]==mapSize ) {
                
            }else if(mapMatrix[wolfNeighborPos[0]][wolfNeighborPos[1]].childNodes[0]){
                if(mapMatrix[wolfNeighborPos[0]][wolfNeighborPos[1]].childNodes[0].currentSrc.split('').reverse().join('').slice(4, 8)=='llaw' || mapMatrix[wolfNeighborPos[0]][wolfNeighborPos[1]].childNodes[0].currentSrc.split('').reverse().join('').slice(4, 8)=='emoh' ){
                 
                }else{
                    thisWolfAvailablePositions.push([wolfNeighborPos[0],wolfNeighborPos[1]])
                }
            }else{
                    thisWolfAvailablePositions.push([wolfNeighborPos[0],wolfNeighborPos[1]])
            }
        })

        availablePositions.push(thisWolfAvailablePositions);
    
    })

    return availablePositions;
}


//In this function Pythagoras calculates the distances from the rabbit to the coordinates where the wolf can go.
function getPythagoras(availablePositions){
   
    var pythagoras = [];

    availablePositions.map(wolf =>{
        wolfPythagoras = [];
        wolf.map(position=>{
           wolfPythagoras.push((Math.sqrt(Math.pow(position[0] - rabbitPosition[0], 2) + Math.pow(position[1] - rabbitPosition[1], 2)))) 
        })

        pythagoras.push(wolfPythagoras);
    })

    return pythagoras;

}



//Here we get the minimum distance from rabbit to for each wolf.
function minDistance (pythagoras) {
    
    var minDistance = [];

    pythagoras.map(distance=>{
        var minIndex = 0
        for (let i = 0; i < distance.length; i++) {
            if (distance[minIndex] > distance[i]) {
                minIndex = i;
            }
        }
        minDistance.push(minIndex);
    })
    return minDistance;

}




//When rabbit and home in same cube
function winGame(){
   
    if( rabbitPosition[0]===homePosition[0] && rabbitPosition[1]===homePosition[1] ){
        container.innerHTML='<h2 class="winGame">!!!YOU WIN!!!</h2>'
    }

}



// What must do program if rabbit and wolf is same cube
function loseGame(){
  
    wolfPosition.map(wolf => {
        if( rabbitPosition[0]===wolf[0] && rabbitPosition[1]===wolf[1] ){
            return container.innerHTML='<h2 class="loseGame">!!!YOU LOSE!!!</h1>';
        }
    })

}



//When you click the "Start New Game" button, this function is called.
function startGame(){
 
    container.innerHTML="";
    wolfPosition=[];
    wallPosition=[];
    setCountsOfChar(document.getElementById('mapSizeSelector').value)
    mapCreator(mapSize);
    createCharechters();
    
}
