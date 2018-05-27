import React, { Component } from 'react';
import './App.css';
import mainLogo from "./assets/Untitled-1.png";
import * as firebase from 'firebase';
import User from './components/User'
import axios from "axios";
import DetailedInfo from "./components/DetailedInfo";
import Forecast from './components/Forecast'
import SavedCities from "./components/SavedCities";
import CurrentWeather from "./components/CurrentWeather";
import { Button, TextField, Grid, Toolbar, Menu, MenuItem, IconButton } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Row, Col } from "reactstrap";


const config = {
    apiKey: "AIzaSyAtymcvGVEattiDOSILXkveeABDWpsO40o",
    authDomain: "weather-app-8bad1.firebaseapp.com",
    databaseURL: "https://weather-app-8bad1.firebaseio.com",
    projectId: "weather-app-8bad1",
    storageBucket: "",
    messagingSenderId: "924881745386"
  };
  firebase.initializeApp(config);

const ITEM_HEIGHT = 45;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCity: 'London',
      user: null,
      forecast: [],
      anchorEl: null
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  // App city search bar functions

  handleChange(e) {
    e.preventDefault();
    this.setState({
      activeCity: e.target.value,
    });
  }

  handleSubmit(e) {
    this.apiRequest();
  }

  componentDidMount() {
    this.apiRequest();
  }

  apiRequest() {
    axios.get(`https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${this.state.activeCity}%2C%20ak%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)
    .then(result => {
      console.log(result.data.query.results.channel);
      const conditions = result.data.query.results.channel;
      console.log(conditions.item.forecast[0])
      this.setState({
        cityName: conditions.title.slice(17),
        temp: conditions.item.condition.temp,
        iconId: conditions.item.condition.code,
        description: conditions.item.condition.text,
        humidity: conditions.atmosphere.humidity,
        time: conditions.lastBuildDate,
        forecast: conditions.item.forecast
      })
  });
    this.setState({
      activeCity: '',
      anchorEl: null
    })
  }

  setUser(user) {
    this.setState({
      user: user
    })
  }

  setTemperatureClass() {
    if (this.state.temp >= 100) {
      return 'boiling'
    } else if (this.state.temp < 100 && this.state.temp >= 85) {
      return 'hot'
    } else if (this.state.temp < 85 && this.state.temp >= 65) {
      return 'warm'
    } else if (this.state.temp < 65 && this.state.temp >= 50) {
      return 'perfect'
    } else if (this.state.temp < 50 && this.state.temp >= 32) {
      return 'cool'
    } else if (this.state.temp < 32) {
      return 'freezing'
    }
  }

  // Menu Open and Close

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  tempClass() {}
  render() {
    const { anchorEl } = this.state;
    return (
      <Grid container justify='center' alignItems='center' className={this.setTemperatureClass()} id='main'>
        <Grid item xs={12} md={8}>
        {/* <AppBar className={this.setTemperatureClass()}> */}
          <Toolbar className='menu'>
            <IconButton
              aria-owns={anchorEl ? 'simple-menu' : null}
              onClick={this.handleClick}
              aria-label="More"
              aria-haspopup="true"
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: 200,
                },
              }}
            >
              <div>
                <MenuItem>
                    <TextField 
                      placeholder='Search Location' 
                      type='text' 
                      onChange={this.handleChange} 
                      value={this.state.activeCity}
                      label="Search Location"
                    />
                    <Button 
                      onClick={this.handleSubmit} 
                      addonType="append"
                      className='location-button'>
                      <i className="fas fa-search"></i>
                    </Button>
                </MenuItem>
              </div>
                <User 
                  firebase={ firebase }
                  setUser={this.setUser.bind(this)}
                  user={this.state.user}
                  currentUser={ this.state.user === null ? 'Guest' : this.state.user.displayName }
                />
              <SavedCities/>
            </Menu>
            <img src={mainLogo} alt='main logo' className='app-bar-logo'/>
          </Toolbar>
        {/* </AppBar> */}
          <Row>
            <Col sm="12" md={{ size: 8, offset: 2 }}>
              <CurrentWeather 
                city={this.state.cityName}
                temp={this.state.temp}
                iconId={this.state.iconId}
                description={this.state.description}
                time={this.state.time}
                humidity={this.state.humidity}
              />
            </Col>
          </Row>
          <Forecast
            forecast={this.state.forecast}
            tempClass={this.setTemperatureClass()}
          />
          <DetailedInfo/>
        </Grid>
      </Grid>
    );
  }
}

export default App;
