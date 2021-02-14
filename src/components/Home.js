import React from 'react'
import { Card } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Login from '../templates/Login'
import { Link, useHistory } from 'react-router-dom'

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
                </Card.Body>
              </Card>
              <Link to="/CreateReview" className="black-color">Create Review</Link>
            </>
          )
        } else {
          return <Login />
        }
      })()}
    </>
  )
}
