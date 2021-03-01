import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import { useAuth } from '../contexts/AuthContext'
import { strage } from '../firebase/index'
import Logout from './Logout'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}))

export default function Header() {
  const { currentUser } = useAuth()
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState(null)
  const [photoURL, setPhotoURL] = useState('')

  const open = Boolean(anchorEl)

  useEffect(() => {
    if (currentUser && currentUser.photoURL) {
      strage
        .ref(currentUser.photoURL)
        .getDownloadURL()
        .then(url => {
          setPhotoURL(url)
        })
    }
  }, [])

  const handleMenu = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    currentUser && (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <div className="">
                <Link to="/" style={{ color: 'white' }}>
                  Cheers!
                </Link>
              </div>
            </Typography>
            {
              <div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {currentUser.displayName}
                  {photoURL !== '' ? (
                    <img src={photoURL} style={{ width: '45px' }} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <div className="w-100 text-center mt-2">
                      <Link to="/profile" className="w-100 mt-3 black-color">
                        Profile
                      </Link>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Logout />
                  </MenuItem>
                </Menu>
              </div>
            }
          </Toolbar>
        </AppBar>
      </div>
    )
  )
}
