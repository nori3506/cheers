import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import logoutIcon from '../assets/icons/logout.svg'

export default function Logout({ setMenuOpen }) {
  const { logout } = useAuth()
  const history = useHistory()

  const handleLogout = async () => {
    try {
      await logout()
      history.push('/')

      // いったん以下おいといて！
      // history.pushState('/login')
    } catch {
      console.log('Failed to Log out')
    }
  }

  const handleClick = () => {
    setMenuOpen(false)

    if (window.confirm('Are you sure to logout?')) {
      handleLogout()
    }
  }

  return <img src={logoutIcon} alt="Link to Profile" className="icon" onClick={handleClick} />
}
