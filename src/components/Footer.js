import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../firebase/index'
import Logout from './Logout'
import homeIcon from '../assets/icons/home.svg'
import addReviewIcon from '../assets/icons/add-review.svg'
import profileIcon from '../assets/icons/profile.svg'
import profileDefaultIcon from '../assets/icons/default_profile_picture.svg'

export default function Footer() {
  const { currentUser } = useAuth()

  const [photoURL, setPhotoURL] = useState(profileDefaultIcon)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    storage
      .ref(currentUser.photoURL)
      ?.getDownloadURL()
      .then(url => {
        setPhotoURL(url)
      })
  }, [])

  const handleClick = () => setMenuOpen(prev => !prev)

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

            <li className="icon-button--create-review">
              <Link to="/CreateReview">
                <img src={addReviewIcon} alt="Link to Add Review" />
              </Link>
            </li>

            <li className="icon-button--profile-menu">
              <ul className={menuOpen ? 'profile-menu profile-menu-open' : 'profile-menu'}>
                <li onClick={handleClick} className="icon-button--portrait">
                  {menuOpen ? (
                    <img src={addReviewIcon} alt="close sub menu" className="icon--close" />
                  ) : (
                    <img
                      src={photoURL}
                      alt="user portrait"
                      className={photoURL === profileDefaultIcon ? null : 'icon--portrait'}
                    />
                  )}
                </li>

                <li className="icon-button--profile">
                  <Link to="/profile" className="nav-link--profile">
                    <img src={profileIcon} alt="Link to Profile" />
                  </Link>
                </li>

                <li className="icon-button--logout">
                  <Logout setMenuOpen={setMenuOpen} />
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
