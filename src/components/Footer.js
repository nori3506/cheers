import React from 'react'
import { Link } from 'react-router-dom'
import Logout from './Logout'
import homeIcon from '../assets/icons/home.svg'
import addReviewIcon from '../assets/icons/add-review.svg'
import profileIcon from '../assets/icons/profile.svg'

export default function Footer() {
  return (
    <footer>
      <div className="wrapper">
        <nav>
          <ul>
            <li>
              <Link to="/" className="nav-link--home">
                <img src={homeIcon} alt="Link to Home" className="icon" />
              </Link>
            </li>
            <li className="icon-button--create-review">
              <Link to="/CreateReview">
                <img src={addReviewIcon} alt="Link to Add Review" className="icon" />
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link--profile">
                <img src={profileIcon} alt="Link to Profile" className="icon" />
              </Link>
            </li>
            <li className="icon-button--logout">
              <Logout />
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
