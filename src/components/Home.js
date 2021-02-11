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
                  <h2 className="text-center mb-4">Shop List</h2>
                  <p><Link to="/">Cactus Club Denman st.</Link></p>
                  <p><Link to="/">Guu Restaurant</Link> </p>
                </Card.Body>
              </Card>
              <Link to="/CreateReview">Create Review</Link>
            </>
          )
        } else {
          return <Login />
        }
      })()}
    </>
  )
}
