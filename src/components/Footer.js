import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../firebase/index'
import homeIcon from '../assets/icons/home.svg'
import addReviewIcon from '../assets/icons/add-review.svg'
import profileIcon from '../assets/icons/profile.svg'
import profileDefIcon from '../assets/icons/def-profile.svg'
import logoutIcon from '../assets/icons/logout.svg'

const Footer = () => {
  const { currentUser } = useAuth()
  const { logout } = useAuth()
  const history = useHistory()

  const [photoURL, setPhotoURL] = useState(profileDefIcon)
  const [menuOpen, setMenuOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    currentUser &&
      storage
        .ref(currentUser.photoURL)
        ?.getDownloadURL()
        .then(url => setPhotoURL(url))
  }, [currentUser])

  const handleMenuToggle = () => setMenuOpen(prev => !prev)
  const handleMenuClose = () => setMenuOpen(false)
  const handlePopupOpen = () => {
    handleMenuClose()
    setPopupOpen(true)
  }
  const handlePopupClose = () => setPopupOpen(false)
  const handleLogout = () => {
    setPopupOpen(false)
    logout()
      .then(() => history.push('/'))
      .catch(err => console.log('Failed to log out: ', err))
  }

  const Popup = () => {
    return (
      <div className="overlay--trans">
        <div className="popup">
          <p className="popup-message">Are you sure to logout this account?</p>
          <div className="btn-area--half">
            <button onClick={handlePopupClose} className="btn--secondary btn--half">
              Cancel
            </button>
            <button onClick={handleLogout} className="btn--primary btn--half">
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentUser) {
    return (
      <>
        {popupOpen ? <Popup /> : null}

        <footer>
          <div className="wrapper">
            <nav>
              <ul className="main-menu">
                <li>
                  <Link to="/" onClick={handleMenuClose} className="nav-link--home">
                    <img src={homeIcon} alt="Link to Home" />
                  </Link>
                </li>

                <li className="icon-btn--create-review">
                  <Link to="/CreateReview" onClick={handleMenuClose}>
                    <img src={addReviewIcon} alt="Link to Add Review" />
                  </Link>
                </li>

                <li className="icon-btn--profile-menu">
                  <ul className={menuOpen ? 'profile-menu profile-menu-open' : 'profile-menu'}>
                    <li onClick={handleMenuToggle} className="icon-btn--portrait">
                      {menuOpen ? (
                        <img src={addReviewIcon} alt="close" className="icon--close" />
                      ) : (
                        <img
                          src={photoURL}
                          alt="user portrait"
                          className={photoURL === profileDefIcon ? null : 'icon--portrait'}
                        />
                      )}
                    </li>

                    <li className="icon-btn--profile">
                      <Link to="/profile" onClick={handleMenuClose} className="nav-link--profile">
                        <img src={profileIcon} alt="profile" />
                      </Link>
                    </li>

                    <li className="icon-btn--logout">
                      <img
                        src={logoutIcon}
                        alt="power"
                        onClick={handlePopupOpen}
                        className="icon"
                      />
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </>
    )
  } else {
    return null
  }
}

export default Footer
