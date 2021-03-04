import React, { useState, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../firebase/index'
import backArrowIcon from '../assets/icons/back-arrow.svg'

export default function Header({ title }) {
  // Fetch user profile image (currently not used) ========== //
  const { currentUser } = useAuth()

  const [photoURL, setPhotoURL] = useState('hey')

  useEffect(() => {
    if (currentUser && currentUser.photoURL) {
      storage
        .ref(currentUser.photoURL)
        .getDownloadURL()
        .then(url => {
          setPhotoURL(url)
        })
    }
  }, [])
  // ======================================================== //

  let history = useHistory()
  let location = useLocation()
  let pageTitle

  switch (location.pathname) {
    case '/':
      pageTitle = 'Home'
      break
    case '/CreateReview':
      pageTitle = 'New Review'
      break
    case '/profile':
      pageTitle = 'Profile'
      break
    default:
      pageTitle = ''
  }

  return (
    currentUser && (
      <header>
        <div className="wrapper header__wrapper">
          <Link to="/" className="header__back-arrow">
            <img
              src={backArrowIcon}
              alt="Link to Add Review"
              className="footer__icon"
              onClick={() => history.goBack()}
            />
          </Link>
          <h1 className="header__title">{pageTitle}</h1>
        </div>
      </header>
    )
  )
}