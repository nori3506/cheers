import React from 'react'
import Signup from './Signup'
import { AuthProvider } from '../contexts/AuthContext'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import GuestRoute from './GuestRoute'
import Header from './Header'
import Footer from './Footer'
import Home from './Home'
import CreateReview from './CreateReview'
import DisplayReview from './DisplayReview'
import Profile from './Profile'
import EditReview from './EditReview'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <GuestRoute path="/signup" component={Signup} />
          <PrivateRoute path="/createreview" component={CreateReview} />
          <PrivateRoute path="/profile" component={Profile} />
          <PrivateRoute exact path={'/shop/:id'} component={DisplayReview} />
          <PrivateRoute exact path={'/review/edit/:id'} component={EditReview} />
        </Switch>
        <Footer />
      </AuthProvider>
    </Router>
  )
}

export default App
