import React from 'react'
import { Card } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Login from '../templates/Login'

export default function Home() {
  const { currentUser } = useAuth()

  return (
    <>
      {(() => {
        if (currentUser) {
          return (
            <>
              <Map />
              <Card>
                <Card.Body>
                  <h2 className="text-center mb-4">Profile</h2>
                  {currentUser.email}
                </Card.Body>
              </Card>
            </>  
          )
        } else {
          return <Login />
        }
      })()}
    </>
  )
}
