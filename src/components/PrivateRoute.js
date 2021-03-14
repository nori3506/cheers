import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useAuth()

  return (
    <>
      <Header />
      <div className="container wrapper">
        <Route
          {...rest}
          render={props => {
            return currentUser ? <Component {...props} /> : <Redirect to="/" />
          }}
        ></Route>
      </div>
      <Footer />
    </>
  )
}
