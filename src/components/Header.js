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
      pageTitle = 'Find reviews'
      break
    case '/CreateReview':
      pageTitle = 'Add a review'
      break
    case '/profile':
      pageTitle = 'Your profile'
      break
    default:
      if (location.pathname.includes('/shop')) {
        pageTitle = 'Location'
      } else if (location.pathname.includes('/review')) {
        pageTitle = 'Edit a review'
      } else {
        pageTitle = ''
      }
  }

  return (
    currentUser && (
      <header>
        <div className="wrapper">
          <Link to="/" className="back-arrow">
            <img src={backArrowIcon} alt="Link to Add Review" onClick={() => history.goBack()} />
          </Link>
        </div>
        <h1 className="page-title">{pageTitle}</h1>
      </header>
    )
  )
}
