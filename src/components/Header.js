import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { strage } from '../firebase/index'
import backArrowIcon from '../assets/icons/back-arrow.svg'

export default function Header(props) {
  // fetch user profile image (currently not used) ========== //
  const { currentUser } = useAuth()

  const [photoURL, setPhotoURL] = useState('')

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
  // ======================================================== //

  let history = useHistory()

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
          <h1 className="header__title">page name</h1>
        </div>
      </header>
    )
  )
}
