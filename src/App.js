import React, {Component} from 'react';
import Pyl from './components/pyl';
import './style/App.css';
import {MuiThemeProvider} from '@material-ui/core';
import {theme} from '../src/components/theme'
import {BrowserRouter as Router, Route} from "react-router-dom";
import Login from "./components/Login";
import communicate from "./api/communication";
import {conf} from "./settings/settings";
import Redirect from "react-router/es/Redirect";
import {Switch}from "react-router";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";

//Private route
class AppRoute extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Route path={this.props.path}
                   render={() => this.props.loggedIn ? <this.props.component/> : <Redirect to="/login/"/>}/>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.changeLogin = this.changeLogin.bind(this);
        //Loggedin is false
        this.state = {
            loggedIn: undefined
        };
    }

    componentDidMount() {
        communicate('getToken').then(data => {
            //if no data is available
            if(!data) return this.setState({
                loggedIn: false
            });

            let reqBody = "refresh_token=" + data.refresh_token + "&grant_type=refresh_token";
            //Fetch via refresh_token
            fetch(conf.apiDomain + "/oauth/token", {
                method: 'POST',
                body: reqBody,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF8',
                    "Authorization": "Basic Y2xpZW50OlRlc3Q="
                }
            }).then(response => response.json())
                .then(json => {
                    //if error exists
                    if (json.error) {
                        throw new Error("Token not valid");
                    } else {
                        //save the new tokens in the json file
                        communicate('saveToken', json).then(res => {
                            //Set the loginstate
                            this.setState({
                                loggedIn: true
                            })
                        });
                    }
                }).catch(err => {
                this.setState({
                    loggedIn: false
                });
            });


        });
    }

    //only for the logincomponent
    changeLogin() {
        this.setState({
            loggedIn: !this.state.loggedIn
        });
    }

    render() {
        let redirect = this.state.loggedIn === undefined ? (
            <Grid container direction="row" justify="center" alignItems="center">
                <CircularProgress style={{marginTop: '40%'}}/>
            </Grid>
        ) : <Redirect to="/login"/>;
        return (
            <Router>
                <MuiThemeProvider theme={theme}>
                    <Switch>


                        <Route path="/login/" render={() => {
                            return <Login changeLogin={this.changeLogin} loggedIn={this.state.loggedIn}/>;
                        }}/>
                        <AppRoute path="/app/" component={Pyl} loggedIn={this.state.loggedIn}/>
                        {redirect}
                    </Switch>


                </MuiThemeProvider>
            </Router>
        )
    }
}

export default App;
