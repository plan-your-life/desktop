import React from "react";
import {withStyles} from '@material-ui/core/styles';
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import DoneIcon from "@material-ui/icons/Done";
import ClearIcon from "@material-ui/icons/Clear";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {conf} from "../../../settings/settings";
import communicate from "../../../api/communication";


const styles = theme => ({
    card: {
        display: 'flex'
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 151,
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    playIcon: {
        height: 38,
        width: 38,
    },
});


class FeedItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(this.props.item.date)
        };
        this.modItem = this.modItem.bind(this);
    }

    modItem(action) {
        communicate('getToken').then(data => {
            if (!data.access_token) {
                throw new Error("Internal error occured, please login again")
            }
            //fetch the feedid to the server to mark it as done
            fetch(conf.apiDomain + '/user/feed/modify?access_token=' + data.access_token + '&id=' + this.props.item.id+"&mod="+action)
                .then(res => {
                    console.log(res);
                    //check if the user has permission
                    if (res.status !== 200) throw new Error("You do not have permission to do that!");
                    //todo: make that a better sentence
                    this.props.openSnack("Item successfuly modified", "success");
                    this.props.getFeed();
                }).catch(e => {
                this.props.openSnack(e.toLocaleString(), "error");
            })
        }).catch(e => {
            //if error occurs, open Snackbar with that error
            this.props.openSnack(e.toLocaleString(), "error");
        });

    }

    render() {
        let border;
        console.log(this.props.item.done);
        //check if the feeditem needs a border
        if (new Date(this.props.item.date) > new Date() && this.props.item.done === undefined)
            border = "1px solid red"
        else if (this.props.item.done === true)
            border = "1px solid green"
        else
            border = "none"
        let item = this.props.item;
        const {classes} = this.props;
        //for shortness purposes
        let newDate = new Date();
        let date;
        //check if the date is today
        if (newDate.toLocaleDateString() === this.state.date.toLocaleDateString()) date = this.state.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        //check ifs tomorrow
        else if (this.state.date.getDate() === newDate.getDate() + 1) date = 'Tomorrow: ' + this.state.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        //output the normal date
        else date = this.state.date.toLocaleDateString() + ' ' + this.state.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <Card className={classes.card} style={{border: border}}>
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography component="h5" variant="h5">
                            {item.title}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {date}
                        </Typography>
                    </CardContent>
                    <div className={classes.controls}>
                        {!this.props.item.done && (
                            <React.Fragment>
                                <IconButton aria-label="Done" onClick={() =>{this.modItem("done")}}>
                                    <DoneIcon style={{color: "green"}}/>
                                </IconButton>

                            </React.Fragment>

                        )}

                        <IconButton onClick={() =>{this.modItem("del")}}>
                            <ClearIcon style={{color: "red"}}/>
                        </IconButton>
                    </div>
                </div>
            </Card>
    );
    }
    }

    export default withStyles(styles, {withTheme: true})(FeedItem);