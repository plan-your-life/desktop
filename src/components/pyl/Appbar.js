import {DarkAppBar} from "../theme";
import {Toolbar} from "@material-ui/core";
import React from "react";
import Typography from "@material-ui/core/Typography";
import AccountIcon from '@material-ui/icons/AccountCircle';

export default class AppBar extends React.Component{
    constructor(props){
        super(props);
    }
    render() {
        return (
            <DarkAppBar position="fixed" color="default">
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        {this.props.title}

                    </Typography>
                    <AccountIcon style={{marginLeft: 'auto'}}/>
                </Toolbar>
            </DarkAppBar>
        );
    }
}