import React from 'react'
import { Link } from 'react-router-dom'
import Logout from './Logout'
import homeLogo from '../assets/icons/home.svg'
import addReviewLogo from '../assets/icons/add-review.svg'

export default function Footer() {
  return (
    <footer>
      <div className="wrapper">
        <nav>
          <ul>
            <li>
              <Link to="/" className="nav-link--home">
                <img src={homeLogo} alt="Link to Home" className="icon" />
              </Link>
            </li>
            <li className="icon-button--create-review">
              <Link to="/CreateReview">
                <img src={addReviewLogo} alt="Link to Add Review" className="icon" />
              </Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Logout />
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
