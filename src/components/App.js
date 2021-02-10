import React from "react"
import Signup from "./Signup"
import { Container } from "react-bootstrap"
import { AuthProvider } from "../contexts/AuthContext"
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from "./Home"
import Login from "./Login"
import PrivateRoute from "./PrivateRoute"
import GuestRoute from "./GuestRoute"
import Header from "./Header"
import CreateReview from "./CreateReview"


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
          </Switch>
        </AuthProvider>
      </Router>
      </div>
    </Container>
  )
}

export default App;
