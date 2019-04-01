import Grid from '@material-ui/core/Grid';
import {TextField} from '@material-ui/core/';
import {Send} from '@material-ui/icons';
import {styles, DarkBtn} from './theme';
import React, {Component} from 'react';
import fetch from 'node-fetch';
import '../style/Login.css';
import {conf} from '../settings/settings';
import communicate from '../api/communication';
import {AuthenticationError, BlockedError} from "../api/ErrorClasses";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Redirect from "react-router/es/Redirect";


function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//Login Component. Gets displayed when the user isnt loggedin or no key is stored
export default class Login extends Component {
    constructor(props) {
        super(props);
        //set states
        this.state = {
            errorMsg: '',
            successMsg: '',
            username: '',
            password: '',
            email: '',
            token: '',
            retypePassword: '',
            value: 0,
            loading: false
        };
        //bind it
        this.handleLogin = this.handleLogin.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleReg = this.handleReg.bind(this);
        this.verifyCaptcha = this.verifyCaptcha.bind(this);
    }

    //Method to handle the login
    handleLogin(e) {
        e.preventDefault();
        //Checks if any fields is empty and set an error msg if required
        if (!this.state.username || !this.state.password) {
            this.setState({
                errorMsg: 'Fields cannot be empty'
            });
            return;
        }
        //Body which gets submitted to the server
        let reqBody = "username=" + this.state.username + "&password=" + this.state.password + "&grant_type=password";
        //Fetch the data to the server
        fetch(conf.apiDomain + '/oauth/token', {
            method: 'POST',
            body: reqBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF8',
                "Authorization": "Basic Y2xpZW50OlRlc3Q="
            }
        })
            .then(res => res.json())
            .then(json => {
                //Throws the error, regardless which error the Server gets
                if (!json.access_token) {
                    if (json.error_message === "Blocked") {
                        throw new BlockedError("User is temporarily blocked, please try again later")
                    }
                    throw new AuthenticationError('Username or password wrong');
                }
                //Save the key locally
                communicate('saveToken', json).then(res => {
                    //if an error occurs
                    if (!res) throw new Error(res.toString());
                    //change the loginstate
                    this.props.changeLogin();
                });
            })
            .catch(error => {
                //if the error is an authentication error throw it
                if (error instanceof AuthenticationError) {
                    this.setState({
                        errorMsg: error.msg
                    });
                } else if (error instanceof BlockedError) {
                    this.setState({
                        errorMsg: error.msg
                    })
                }
                //if its not, than its an connection error.
                else {
                    this.setState({
                        errorMsg: "Connection error, please try again in a few minutes."
                    });
                }
            });
    }

    //handle the change
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    //register function clientside
    handleReg(e) {
        e.preventDefault();
        //Set loading
        this.setState({
            loading: true
        });
        const reqBody = JSON.stringify({
            username: this.state.username,
            password: this.state.password,
            email: this.state.email
        });
        fetch(conf.apiDomain + "/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: reqBody
            }
        ).then(res => {
            this.setState({
                loading: false
            })
            //Throw error if an error exists in json object
            if (res.status === 400) throw new Error("Check your input, password has to be at least 8 characters.");
            else if (res.status === 409) throw new Error("User already exists");
            else if (res.status === 200) {
                this.setState({
                    successMsg: "Successfully registered, check your E-Mails and you spam folder",
                    errorMsg: ""
                })
            }
            //throw connection error, if needed
            else throw new Error("Connection error, try again later");

        })
            .catch(e => {
                this.setState({
                    errorMsg: e.toLocaleString(),
                    successMsg: ''
                })

            })
    }

    verifyCaptcha(token) {
        this.setState({
            token: token
        })
    }

    render() {
        let RegisterButton,LoginButton, RegisterForm;
        //check username and password for login button
        if (this.state.username && this.state.password) {
            LoginButton = (<DarkBtn type="submit" variant="contained">
                Login
                <Send/>
            </DarkBtn>);
            //check the rest for the register function
            if (this.state.retypePassword && this.state.password.length > 8 && this.state.password === this.state.retypePassword && validateEmail(this.state.email)) {
                RegisterButton = (<DarkBtn type="submit" variant="contained">
                    Register
                    <Send/>
                </DarkBtn>)
            } else {
                RegisterButton = (<DarkBtn type="submit" variant="contained" disabled>
                    Register
                    <Send/>
                </DarkBtn>)
            }
        } else {
            LoginButton = (<DarkBtn type="submit" variant="contained" disabled>
                Login
                <Send/>
            </DarkBtn>);
            RegisterButton = (<DarkBtn type="submit" variant="contained" disabled>
                Register
                <Send/>
            </DarkBtn>)
        }
        //if undefined show circular progress
        if(this.props.loggedIn === undefined) return (
            <Grid container direction="row" justify="center" alignItems="center">
                <CircularProgress style={{marginTop: '40%'}}/>
            </Grid>
        );
        //else show the login
        else if(this.props.loggedIn === false){
            return (
                <Grid container direction="row" justify="center" alignItems="center">
                    <div className='main'>
                        <Tabs value={this.state.value} onChange={(e, value) => this.setState({value: value})}
                              textColor="#DCDCDC" indicatorColor="primary">
                            <Tab label="Login"/>
                            <Tab label="Register"/>
                        </Tabs>
                        {this.state.value === 0 && (
                            <form onSubmit={this.handleLogin}>

                                <Grid item xs={12}>
                                    <Typography style={{color: styles.text.color, marginTop: "4%"}}
                                                variant="h4">Login</Typography>
                                    <div className="errorMsg">{this.state.errorMsg}</div>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="username"
                                        label="Username"
                                        onChange={this.handleChange('username')}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="password"
                                        label="Password"
                                        onChange={this.handleChange('password')}
                                        margin="normal"
                                        type="password"
                                    />
                                </Grid>
                                <Grid item xs={12} style={{marginTop: '1vh'}}>
                                    {LoginButton}
                                </Grid>

                            </form>
                        )}
                        {this.state.value === 1 && (
                            <form onSubmit={this.handleReg}>
                                <Grid item xs={12}>
                                    <Typography style={{color: styles.text.color, marginTop: "4%"}}
                                                variant="h4">Register</Typography>
                                    <div className="errorMsg">{this.state.errorMsg}</div>
                                    <div className="successMsg">{this.state.successMsg}</div>
                                </Grid>
                                {this.state.loading === true && (
                                    <Grid container direction="row" justify="center" alignItems="center">
                                        <CircularProgress style={{ marginTop : "10%"}} />
                                    </Grid>
                                )}
                                {this.state.loading === false && (
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <TextField
                                                id="email"
                                                label="E-Mail Address"
                                                onChange={this.handleChange('email')}
                                                fullWidth
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                id="username"
                                                label="Username"
                                                fullWidth
                                                onChange={this.handleChange('username')}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                id="password"
                                                label="Password"
                                                onChange={this.handleChange('password')}
                                                margin="normal"
                                                type="password"
                                            />
                                            <TextField
                                                id="retypePassword"
                                                label="Retype password"
                                                onChange={this.handleChange('retypePassword')}
                                                margin="normal"
                                                type="password"
                                            />
                                        </Grid>
                                        <Grid item xs={12} style={{marginTop: '1vh'}}>
                                            {RegisterButton}
                                        </Grid>
                                    </React.Fragment>
                                )}

                            </form>
                        )}
                    </div>
                </Grid>);
        }
        //if logged in, return to feed
        else return <Redirect to="/app/feed"/>;
    }
}