import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../firebase/index'
import Logout from './Logout'
import homeIcon from '../assets/icons/home.svg'
import addReviewIcon from '../assets/icons/add-review.svg'
import profileIcon from '../assets/icons/profile.svg'
import profileDefIcon from '../assets/icons/def-profile.svg'

const Footer = () => {
  const { currentUser } = useAuth()

  const [photoURL, setPhotoURL] = useState(profileDefIcon)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    currentUser &&
      storage
        .ref(currentUser.photoURL)
        ?.getDownloadURL()
        .then(url => setPhotoURL(url))
  }, [])

  const handleClick = () => setMenuOpen(prev => !prev)

  if (currentUser) {
    return (
      <footer>
        <div className="wrapper">
          <nav>
            <ul className="main-menu">
              <li>
                <Link to="/" className="nav-link--home">
                  <img src={homeIcon} alt="Link to Home" />
                </Link>
              </li>

              <li className="icon-btn--create-review">
                <Link to="/CreateReview">
                  <img src={addReviewIcon} alt="Link to Add Review" />
                </Link>
              </li>

              <li className="icon-btn--profile-menu">
                <ul className={menuOpen ? 'profile-menu profile-menu-open' : 'profile-menu'}>
                  <li onClick={handleClick} className="icon-btn--portrait">
                    {menuOpen ? (
                      <img src={addReviewIcon} alt="close sub menu" className="icon--close" />
                    ) : (
                      <img
                        src={photoURL}
                        alt="user portrait"
                        className={photoURL === profileDefIcon ? null : 'icon--portrait'}
                      />
                    )}
                  </li>

                  <li className="icon-btn--profile">
                    <Link to="/profile" className="nav-link--profile">
                      <img src={profileIcon} alt="Link to Profile" />
                    </Link>
                  </li>

                  <li className="icon-btn--logout">
                    <Logout setMenuOpen={setMenuOpen} />
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    )
  } else {
    return null
  }
}

export default Footer
