import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router-dom'

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

  const value = {
    error
  }

  return (
    <div className="w-100 text-center mt-2">
      <Button variant="link" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
}

export default Logout;
