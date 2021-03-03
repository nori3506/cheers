import React from 'react'
import { Link } from 'react-router-dom'
import Logout from './Logout'
import homeLogo from '../assets/icons/home.svg'
import addReviewLogo from '../assets/icons/add-review.svg'

export default function Footer() {
  return (
    <footer>
      <div className="wrapper footer__wrapper">
        <nav>
          <ul className="footer__list">
            <li className="footer__list-item">
              <Link to="/" className="footer__link footer__link--home">
                <img src={homeLogo} alt="Link to Home" className="footer__icon" />
              </Link>
            </li>
            <li className="footer__list-item footer__list-item--create-review">
              <Link to="/CreateReview" className="footer__link">
                <img src={addReviewLogo} alt="Link to Add Review" className="footer__icon" />
              </Link>
            </li>
            <li className="footer__list-item">
              <Link to="/profile" className="footer__link">
                Profile
              </Link>
            </li>
            <li className="footer__list-item">
              <Logout />
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
