import React, {Component} from 'react';
import '../style/Pyl.css';
import {styles} from "./theme";

import AppBar from "./pyl/Appbar";
import Sidenav from "./pyl/Sidenav";
import {Route, Switch} from 'react-router-dom'
import BottomNav from "./pyl/BottomNav";
import Feed from './pyl/Feed';
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import Content from "./Snackbarcontent";

export default class Pyl extends Component {
    constructor(props) {
        //call the super
        super(props);
        //Set the state
        this.state = {
            title: "Feed",
            snackMsg: '',
            snackVariant: '',
            snackOpen: false
        };
        this.openSnack = this.openSnack.bind(this);
        this.snackClose = this.snackClose.bind(this);
    }
    //Opens the snackbar
    openSnack(msg, variant){
        this.setState({
            snackMsg: msg,
            snackVariant: variant,
            snackOpen: true
        });
    }
    snackClose(){
        this.setState({
            snackOpen: false
        })
    }
    render() {
        return (
            <div style={styles.text}>
                <AppBar title={this.state.title}/>
                <Grid container className='mainGrid' direction="row" justify="flex-start" alignItems="flex-start">
                    <Grid item xs={12}>
                        <Switch>
                            <Route path="/app/feed/" render={() => <Feed openSnack={this.openSnack} />}/>
                            <Route path="/app/calendar/" render={() => <h1>Test2</h1>}/>
                            <Route path="/app/tickets/" render={() => <h1>Test3</h1>}/>
                            <Route path="/app/mail/" render={() => <h1>Test4</h1>}/>
                        </Switch>
                    </Grid>
                </Grid>
                <BottomNav/>
                <Sidenav/>
                <Snackbar
                    anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                    open={this.state.snackOpen}
                    autoHideDuration={6000}
                    onClose={this.snackClose}
                >
                    <Content
                        variant={this.state.snackVariant}
                        onClose={this.snackClose}
                        message={this.state.snackMsg}
                    />
                </Snackbar>
            </div>
        );
    }
}