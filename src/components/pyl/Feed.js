import React from "react";
import {Grid, Fab, Tooltip, Menu, MenuItem, Divider, Modal, TextField, Button} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import Typography from "@material-ui/core/Typography";
import {conf} from "../../settings/settings";
import communicate from "../../api/communication";
import {CircularProgress} from "@material-ui/core";
import FeedItem from "./Feed/FeedItem";

//function to get the style of the modal
function getModalStyle() {
    const top = 25;
    return {
        top: `${top}%`,
        margin: 'auto'
    };
}

//Function to format the date to a good format for the date selection
function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

//Todo: Userinvitions at meetings
//Todo: Put those two into one component
class RemModal extends React.Component {
    constructor(props) {
        super(props);
        let date = new Date();
        this.state = {
            date: formatDate(date),
            title: '',
            time: '',
            errorMsg: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        //split things up, to make it possible to create a new date object
        let submitDate = this.state.date.split('-');
        let submitTime = this.state.time.split(':');
        //create a date based on the users input
        let selectedDate = new Date(submitDate[0], submitDate[1] - 1, submitDate[2], submitTime[0], submitTime[1]);
        //check if the date is in the past
        if (selectedDate < new Date()) {
            return this.props.openSnack('You cannot create a reminder in the past!', 'error');
        }

        const reqBody = JSON.stringify({
            title: this.state.title,
            date: selectedDate
        });
        //check if title is set
        if (!this.state.title) {
            this.props.openSnack('Please specify a title', 'error');
            return;
        }
        let accessToken;
        //get the accesstoken and then do the request
        communicate('getToken').then(data => {
            accessToken = data.access_token;
            fetch(conf.apiDomain + '/user/feed?access_token=' + accessToken, {
                method: 'POST',
                body: reqBody,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (res.status !== 200)
                    throw new Error("Some error occured, please try again later");
                //show snackbar and close the modal
                this.props.openSnack("Reminder successfully created", 'success');
                this.props.handleClose('remModal');
                this.props.getFeed();

            }).catch(e => {
                this.props.openSnack(e.toLocaleString(), 'error');
            })
        });
    }

    render() {
        return (
            <Modal
                open={this.props.remModal}
                onClose={() => {
                    this.props.handleClose('remModal')
                }}
                aria-labelledby="reminderModal"
                aria-describedby="reminderModal-descr"
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={getModalStyle()} className='modalPaper'>
                    <Typography variant="h6" id="reminderModal">
                        Create a reminder
                    </Typography>
                    <form id="reminderModal-descr" onSubmit={this.handleSubmit}>
                        <p>{this.state.errorMsg}</p>
                        <Grid container
                              direction="row"
                              justify="center"
                              alignItems="center"
                        >
                            <Grid item xs={12}>
                                <TextField
                                    id="title"
                                    label="Title"
                                    onChange={(event) => {
                                        this.setState({title: event.target.value});
                                    }}
                                    margin="normal"
                                    type="text"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    id="date"
                                    label="Date"
                                    onChange={(event) => {
                                        this.setState({date: event.target.value});
                                    }}
                                    margin="normal"
                                    defaultValue={this.state.date}
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    id="time"
                                    label="Time"
                                    onChange={(event) => {
                                        this.setState({time: event.target.value});
                                    }}
                                    margin="normal"
                                    defaultValue={this.state.time}
                                    type="time"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button color="primary" type="submit">
                                    Create
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </Modal>
        );
    }

}

function MeetingModal(props) {
    return (
        <Modal
            open={props.meetingModal}
            onClose={() => {
                props.handleClose('meetingModal')
            }}
            aria-labelledby="meetingModal"
            aria-describedby="meetingModal-descr"
            style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={getModalStyle()} className='modalPaper'>
                <Typography variant="h6" id="meetingModal">
                    Create a meeting
                </Typography>
                <Typography variant="subtitle1" id="meetingModal-descr">
                    Testtext
                </Typography>
            </div>
        </Modal>
    );
}


export default class Feed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOpened: null,
            items: null,
            remModal: false,
            meetingModal: false,
            selectedDate: new Date()
        };
        //Bind the methods to the object
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.openModal = this.openModal.bind(this);
        this.getFeed = this.getFeed.bind(this);
    }

    handleOpenMenu(event) {
        //Set the state
        this.setState({
            menuOpened: event.currentTarget
        })
    }

    handleClose(name) {
        this.setState({
            [name]: null
        })
    }

    //method for opening modals
    openModal(name) {
        this.setState({
            [name]: true
        })
    }

    getFeed() {
        //set the items to null to prevent errors
        this.setState({
            items: null
        });
        communicate('getToken').then(data => {
            if (!data.access_token) throw new Error("Unknown error, please restart your app!");
            //fetch it from the server
            fetch(conf.apiDomain + '/user/feed?access_token=' + data.access_token).then(res => {
                //catch errors
                if (res.status !== 200) {
                    throw new Error("Unknown error, please restart your app!")
                }
                return res.json();
            }).then(json => {
                //set the items
                this.setState({
                    items: json
                })
            })
                .catch(e => {
                    this.props.openSnack(e.toLocaleString(), "error");
                })
        }).catch(e => {
            //if error, open snackbar
            this.props.openSnack(e.toLocaleString(), "error");
        });
    }

    //here load the feed
    componentDidMount() {
        this.getFeed();
    }

    render() {
        //feed
        let todo = [], done = [], itemContainer;

        //show preloader
        if (this.state.items === null) {
            itemContainer = (
                <Grid container direction="row" justify="center" alignItems="center">
                    <CircularProgress/>
                </Grid>)
        }
        //empty feed
        else if (this.state.items === []) {
            itemContainer = (<Typography variant="body1">Oh.. here seems to be nothing! Just create your first
                reminders</Typography>)
        } else {
            this.state.items.forEach(item => {
                const pushItem = (
                    <Grid key={item.key} item xs={7} style={{marginTop: '1%'}}>
                        <FeedItem getFeed={this.getFeed} item={item} openSnack={this.props.openSnack}/>
                    </Grid>
                );
                if (item.done) done.push(pushItem);
                else todo.push(pushItem);


            });
            console.log(done.length);
            itemContainer = (
                <React.Fragment>
                    {todo.map(item => item)}
                    {done.length > 0 && todo.length > 0 && (<Grid style={{marginTop: "10px"}} item xs={7}>
                        <Divider/>
                    </Grid>)}
                    {done.map(item => item)}
                </React.Fragment>
            );
        }
        return (
            <div>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                >
                    <Grid item xs={12}>
                        <Tooltip title="Add an event or a reminder">
                            <Fab color="primary" onClick={this.handleOpenMenu}>
                                <AddIcon/>
                            </Fab>
                        </Tooltip>
                        <Menu
                            anchorEl={this.state.menuOpened}
                            open={Boolean(this.state.menuOpened)}
                            onClose={() => {
                                this.handleClose('menuOpened')
                            }}
                        >
                            <MenuItem onClick={() => {
                                this.openModal('remModal')
                            }}>Reminder</MenuItem>
                            <MenuItem onClick={() => {
                                this.openModal('meetingModal')
                            }}>Event</MenuItem>
                        </Menu>
                    </Grid>
                    < Grid
                        item
                        xs={7}>
                        <br/> <Divider/>
                    </Grid>
                    {itemContainer}
                </Grid>
                <RemModal handleClose={this.handleClose} remModal={this.state.remModal}
                          openSnack={this.props.openSnack} getFeed={this.getFeed}/>
                <MeetingModal handleClose={this.handleClose} meetingModal={this.state.meetingModal}/>
            </div>
        )
    }
}