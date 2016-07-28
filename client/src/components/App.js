import React from 'react';
import { Authentication } from './Authentication';
import { Authenticated } from './Authenticated';

const dummyData = [
  {
    name: '',
    lat: 37.785,
    lng: -122.409,
    address: '',
    shortDescription: '',
    detailedDescription: '',
    bust: 'hello hello',
    comments: [],
    checkin: [],
  },
  {
    name: '',
    lat: 37.787,
    lng: -122.409,
    address: '',
    shortDescription: '',
    detailedDescription: '',
    bust: 'hello hello',
    comments: [],
    checkin: [],
  },
];

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: null,
      location: '37.7835-122.4096',
      // demoMode: true,
      userLoggedIn: true,
      username: 'Tyler',
      center: { lat: 37.7843, lng: -122.4096 },
      zoom: 15,
      counter: 0.0001,
      score: 0,
      treasureChestData: dummyData,
    };
  }

  componentWillMount() {
    this.logOutUser = this.logOutUser.bind(this);

    this.getUserScore();
    this.props.mainSocket.on('getUserScore', (score) => {
      this.setState({
        score: score
      })
    });
    // selects and executes which source to use for setting the location state of
    // user.
    const locationSource = this.updateLocationState.bind(this);
    setInterval(locationSource, 500);

    this.props.mainSocket.on('updateTreasureState', (location) => {
      if (location) {
        this.updateUserPoints();
      }
    });

    this.props.mainSocket.on('updateUserPoints', (results) => {
      if (results) {
        console.log('Here is your score: ', this.state.score);
        this.state.score++;
      }
    });

    this.props.mainSocket.on('Authentication', (userDetails) => {
      this.setState({
        userLoggedIn: userDetails.userLoggedIn,
        username: userDetails.username,
      });
    });
  }

  getUserScore() {
    this.props.mainSocket.emit('getUserScore', {username: this.state.username});
  }

  updateUserPoints() {
    var userObj = { username: this.state.username, location: this.state.location };

    this.props.mainSocket.emit('updateUserPoints', userObj);
  }
  // will continually update our location state with our new position
  // returned from navigator.geolocation and check if we are in chat room
  setPosition(position) {
    const latRound = position.coords.latitude.toFixed(4);
    const lonRound = position.coords.longitude.toFixed(4);
    const location = latRound.toString() + lonRound.toString();
    this.setState({
      location,
    });
    this.updateTreasureState();
  }

  // will watch our location and frequently call set position
  updateLocationState() {
    // need this, every individual call to move
    var dummyLat = 37.7847;
    var dummyLon = -122.4096;
    let position = {};
    position.coords = {};
    position.coords.latitude = dummyLat + this.state.counter;
    position.coords.longitude = dummyLon;
    this.setPosition(position);
    var reCount = this.state.counter + 0.0001;
    this.setState({
      counter: reCount,
    });

    // listens for a location update from the demo server
    // this.props.demoSocket.on('updateLocationStateDemo', (data) => {
    //   this.setPosition(position);
    // });

    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(this.setPosition.bind(this), this.error);
    // } else {
    //   console.log('geolocation not supported');
    // }
  }

  // socket request to demo server to update the state of the location of the app


  // socket request to the main server to update messages state based on location state
  updateTreasureState() {
    this.props.mainSocket.emit('updateTreasureState', this.state.location);
  }

  logOutUser() {
    this.setState({
      userLoggedIn: false,
    });
  }

  render() {
    const loggedIn = (
      <Authenticated
        dummyLat={Number(this.state.location.slice(0,6))}
        dummyLong={-122.4096}
        messages={this.state.messages}
        userLoggedIn={this.state.userLoggedIn}
        addMessageToChatRoom={this.addMessageToChatRoom}
        createChatRoom={this.createChatRoom}
        logOutUser={this.logOutUser}
        zoom={this.state.zoom}
        center={this.state.center}
        treasureChestData={this.state.treasureChestData}
        score={this.state.score}
      />
    );

    const notLoggedIn = (
      <Authentication
        mainSocket={this.props.mainSocket}
      />
    );

    let childToRender = !!this.state.userLoggedIn ? loggedIn : notLoggedIn;

    return (
      <div>
        {childToRender}
      </div>
    );
  }
}
