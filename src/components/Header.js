import React from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import backArrowIcon from '../assets/icons/back-arrow.svg'

const Header = () => {
  const { currentUser } = useAuth()
  const history = useHistory()
  const location = useLocation()
  let pageTitle = ''

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
      }
  }

  if (currentUser) {
    return (
      <header>
        <div className="wrapper">
          <Link to="/" className="back-arrow">
            <img src={backArrowIcon} alt="Link to Add Review" onClick={() => history.goBack()} />
          </Link>
        </div>
        <h1 className="page-title">{pageTitle}</h1>
      </header>
    )
  } else {
    return null
  }
}

export default Header
