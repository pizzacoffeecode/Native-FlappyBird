import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native'
import { useState, useEffect } from 'react';

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;
const GRAVITY = 4;
const JUMP_HEIGHT = 50;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_GAP = 125;

const flapDown = require("./assets/redbird-downflap.png");
const flapMid = require("./assets/redbird-midflap.png");
const flapUp = require("./assets/redbird-upflap.png");

export default function App() {

  const [ birdVertPosition, setbirdVertPosition ] = useState(180);
  const [ gameHasStarted, setGameHasStarted ] = useState(false);
  const [ obstacleHeight, setObstacleHeight ] = useState(200);
  const [ obstacleLeft, setObstacleLeft ] = useState(GAME_WIDTH - OBSTACLE_WIDTH);
  const [ score, setScore ] = useState(-1);
  const [ birdAnim, setBirdAnim ] = useState([
    flapDown, flapMid, flapUp
  ]);
  const [ currentFrame, setCurrentFrame ] = useState(require("./assets/redbird-midflap.png"));
  const [ frame, setFrame ] = useState(0);

  const birdHorizPosition = 40;
  const bottomObstacleHeight = GAME_HEIGHT - OBSTACLE_GAP - obstacleHeight;


  //#region //* Gravity
  useEffect(() => {
    let timeId;
    if (gameHasStarted && birdVertPosition < GAME_HEIGHT - BIRD_HEIGHT) {
      timeId = setInterval(() => {
        setbirdVertPosition((birdVertPosition) => birdVertPosition + GRAVITY);
      }, 24)
      return () => {
        clearInterval(timeId)
      }
    }
  }, [ birdVertPosition, gameHasStarted ]);
  //#endregion 
  //#region //* Obstacles
  useEffect(() => {
    let obstacleId;
    let newScore;
    if (gameHasStarted && obstacleLeft >= -OBSTACLE_WIDTH) {
      obstacleId = setInterval(() => {
        setObstacleLeft((obstacleLeft) => obstacleLeft - 3);
      }, 24);
      return () => {
        clearInterval(obstacleId);
      }
    }
    else {
      setObstacleLeft(GAME_WIDTH - OBSTACLE_WIDTH);
      setObstacleHeight(Math.floor((Math.random() * (GAME_HEIGHT - OBSTACLE_GAP))));

    }
    newScore = score;
    setScore(++newScore);
  }, [ gameHasStarted, obstacleLeft ]);
  //#endregion 
  //#region //* Bird Jump
  const handlePress = () => {
    let newbirdVertPosition = birdVertPosition - JUMP_HEIGHT;
    if (!gameHasStarted) {
      setGameHasStarted(true);
    }
    else if (newbirdVertPosition > 0) {
      setbirdVertPosition(newbirdVertPosition);
    }
  }
  //#endregion 
  //#region //* Bird Anim
  useEffect(() => {
    let animTime;
    let count;
    animTime = setInterval(() => {
      if (frame < 3) {
        count = frame + 1;
        setFrame(count % 3);
        // console.log("count ", count);
        // console.log("modulo ", count % 3);
        console.log(currentFrame);

        setCurrentFrame(birdAnim[ frame ]);
      } else {
        setFrame(0);
      }

    }, 24)
    return () => {
      clearInterval(animTime)
    }
  }, [ frame, birdAnim ])

  //#endregion 
  //#region  //* Collision Detection
  useEffect(() => {
    const hasCollidedWithTopObstacle = birdVertPosition >= 0 && birdVertPosition < obstacleHeight; // bool
    const hasCollidedWithBottomObstacle = birdVertPosition <= GAME_HEIGHT && birdVertPosition >= GAME_HEIGHT - bottomObstacleHeight;

    if ((obstacleLeft >= birdHorizPosition) && obstacleLeft <= (birdHorizPosition + OBSTACLE_WIDTH) && (hasCollidedWithTopObstacle || hasCollidedWithBottomObstacle)) {
      setGameHasStarted(false);
      setScore(-2);
    }
  }, [ birdVertPosition, obstacleHeight, bottomObstacleHeight, obstacleLeft ]);
  //#endregion 

  return (
    <StyledView onPress={ handlePress } activeOpacity={ 1 }>
      {/* <StatusBar style="auto" /> */ }
      <GameBox width={ GAME_WIDTH } height={ GAME_HEIGHT } source={ require('./assets/background-day.png') } >
        <StyledText>SCORE : { score }</StyledText>
        <Floor source={ require('./assets/base.png') } />
        <Obstacle
          top={ 0 }
          width={ OBSTACLE_WIDTH }
          height={ obstacleHeight }
          left={ obstacleLeft }
          source={ require('./assets/pipe-green.png') }
        />
        <Obstacle
          top={ GAME_HEIGHT - (obstacleHeight + bottomObstacleHeight) }
          width={ OBSTACLE_WIDTH }
          height={ bottomObstacleHeight }
          left={ obstacleLeft }
          source={ require('./assets/pipe-green.png') }
        />

        <Bird width={ BIRD_WIDTH } height={ BIRD_HEIGHT } top={ birdVertPosition } left={ birdHorizPosition } source={ currentFrame } />
      </GameBox>

    </StyledView >
  );
}

//#region //* Styles
const Bird = styled.Image`
    position: absolute; 
    /* background-color: red; */
    height: ${ props => props.height }px;
    width: ${ props => props.width }px;
    top: ${ props => props.top }px;

    /* border-radius: 50; */
    margin-left: ${ props => props.left }px;
`;

const StyledView = styled.TouchableOpacity`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  
  border-style: solid;
  border-color: black;
  border-width: 3px;
  background-color: #272b30;
`;

const StyledText = styled.Text`
    position: absolute;
    z-index: 3;
    color: gold;
    font-size: 25px;
    align-self: center;
    margin-top: 25px;
    width: 40%;
    text-align: center;
padding-bottom: 3px;
    padding-left: 3px;
    padding-right: 3px;
    border-style: double;
    border-color: gold;
    border-width: 3px;
    border-radius: 50;
`;

const GameBox = styled.ImageBackground`
  height: ${ props => props.height }px;
  width: ${ props => props.width }px;
  background-color: blue;
  overflow: hidden; //* Hides objects leaving the game area
`;

const Floor = styled.Image`
  position: absolute;
  width: 100%;
  height: 112px;
  top: 320px;
`;

const Obstacle = styled.Image`
  position: relative;
  top: ${ props => props.top }px;
  background-color: green;
  width: ${ props => props.width }px;
  height: ${ props => props.height }px;
  left: ${ props => props.left }px;
`;
//#endregion 