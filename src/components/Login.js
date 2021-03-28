import React, { useRef, useState } from 'react'
import { Form, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Link, useHistory } from 'react-router-dom'
import logo from '../assets/icons/logo.svg'

export default function Login() {
  const nameRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  async function hanleSubmit(e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      history.push('/')
    } catch {
      setError('Failed to Sign in')
    }
    setLoading(false)
  }

  return (
    <>
      <div class="login-wrapper">
        <Card>
          <Card.Body id="login">
            <h2 className="text-center mb-4 visually-hidden">Log In</h2>
            <div className="logo-wrapper">
              <img src={logo} className="logo-img" />
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={hanleSubmit}>
              <Form.Group id="email">
              <Form.Label className="visually-hidden">Email</Form.Label>
                <Form.Control placeholder="Email"  type="email" ref={emailRef} required className="input--lg" />
              </Form.Group>
              <Form.Group id="password">
                <Form.Label className="visually-hidden">Password</Form.Label>
                <Form.Control placeholder="Password" type="password" ref={passwordRef} required className="input--lg" />
              </Form.Group>
              <button type="submit" disabled={loading} className="btn--primary">
                Login
              </button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          <p>New to use?</p>
          <p id="link-to-signup"><Link to="/signup">Sign Up</Link></p>
        </div>
      </div>

    </>
  )
}
