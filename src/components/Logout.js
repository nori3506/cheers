import React, { useState } from 'react'
// import { Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import logoutIcon from '../assets/icons/logout.svg'

const Logout = () => {
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const history = useHistory()

  async function handleLogout() {
    setError('aaa')
    try {
      await logout()
      history.push('/')
      // いったん以下おいといて！
      // history.pushState('/login')
    } catch {
      setError('Failed to Log out')
    }
  }

  return (
    // <div className="w-100 text-center mt-2">
    //   <Button variant="link" onClick={handleLogout} className="black-color">
    //     Log Out
    //   </Button>
    // </div>

    <img src={logoutIcon} alt="Link to Profile" className="icon" onClick={handleLogout} />
  )
}

export default Logout
