import {StyledDrawer} from "../theme";
import {Toolbar} from "@material-ui/core";
import {Divider} from "@material-ui/core";
import React from "react";
import {Typography} from "@material-ui/core";

export default class Sidenav extends React.Component{
    constructor(props){
        super(props);
    }
    render() {
        return (
            <StyledDrawer variant="permanent" anchor="right">
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        Contacts
                    </Typography>
                </Toolbar>
                <Divider/>
            </StyledDrawer>)
    }
}

