import {createMuiTheme, withStyles} from '@material-ui/core/styles';
import { Button,AppBar,Drawer, BottomNavigation, Modal } from '@material-ui/core';
import Grid from "@material-ui/core/Grid";

export const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: { main: '#5882FA' },
    },
    typography: {
        useNextVariants: true,
    },
  });
//Styles var 
export const styles = {
    p:{
        color: '#DCDCDC',
        fontSize: '1.7vh'
    },
    text: {
        color: '#DCDCDC'
    },
    h4: {
        fontSize: '3.5vh'
    },

}
//Dark button
export const DarkBtn = withStyles({
    root:{
        background: '#474747',
        color: '#DCDCDC',
        '&:hover': {
            background: '#5f5f5f'
        },
        borderRadius: '0'
    }
})(Button);

export const DarkAppBar = withStyles({
    colorDefault:{
        background: '#404040',
        boxShadow: 'none'
    },
    positionFixed:{
        width: 'calc(100% - 240px)',
        marginRight: 240
    }
})(AppBar);
//Styled drawer
export const StyledDrawer = withStyles({
    paper: {
        width: '240px',
        background: '#404040'
    },
    root: {
        background: '#404040',
        flexShrink: 0,
        width: '240px'
    }
})(Drawer);
//Bottom navigation with lower background color
export const StyledBottomNav = withStyles({
    root:{
        background: '#404040'
    }
})(BottomNavigation);
