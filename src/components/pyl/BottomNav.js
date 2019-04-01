import {StyledBottomNav as BottomNavigation} from "../theme";
import {BottomNavigationAction} from "@material-ui/core";
import {Link} from "react-router-dom";
import React from "react";
import BookIcon from '@material-ui/icons/Book';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import MailIcon from '@material-ui/icons/Email';
import AssignmentIcon from '@material-ui/icons/Assignment';

export default class BottomNav extends React.Component {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            value : 0
        }
    }
    handleChange = (event, value) => {
        this.setState({value});
    };

    render() {
        const {value} = this.state;
        return (
            <BottomNavigation className='BottomNav' showLabels value={value}
                              onChange={this.handleChange}>
                <BottomNavigationAction component={Link} to="/app/feed/" label="Feed" icon={<BookIcon/>}/>
                <BottomNavigationAction component={Link} to="/app/calendar/" label="Calendar" icon={<CalendarIcon/>}/>
                <BottomNavigationAction component={Link} to="/app/mail/" label="Mail" icon={<MailIcon/>}/>
                <BottomNavigationAction component={Link} to="/app/tickets/" label="Tickets" icon={<AssignmentIcon/>}/>
            </BottomNavigation>)
    }
}

