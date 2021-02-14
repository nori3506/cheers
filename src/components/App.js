import React from "react"
import Signup from "./Signup"
import { Container } from "react-bootstrap"
import { AuthProvider } from "../contexts/AuthContext"
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from "./Home"
import PrivateRoute from "./PrivateRoute"
import GuestRoute from "./GuestRoute"
import Header from "./Header"
import CreateReview from "./CreateReview"
import DisplayReview from './DisplayReview'
import Profile from "./Profile"
import '../App.scss';


function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
          <AuthProvider>
            <Header /> <br />
            <Switch>
              <Route exact path="/" component={Home} />
              <GuestRoute path="/signup" component={Signup} />
                <PrivateRoute path="/createreview" component={CreateReview} />
                <PrivateRoute path="/Profile" component={Profile} />
                <PrivateRoute path="/displayreview" component={DisplayReview} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  )
}

export default App;


