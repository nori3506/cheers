import React, { useRef, useState } from 'react'
import { Form, Card, Alert } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/icons/logo.svg'

export default function Signup() {
  const nameRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  async function hanleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('passwords do not match')
    }
    try {
      setError('')
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value)
      history.push('/')
    } catch {
      setError('Failed to sign in')
    }
    setLoading(false)
  }

  return (
    <>
      <div class="signup-wrapper">
        <Card>
          <Card.Body id="login">
            <h2 className="text-center mb-4 visually-hidden">Sign Up</h2>
            <img src={logo}></img>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={hanleSubmit}>
              <Form.Group id="name">
                <Form.Label className="visually-hidden">Name</Form.Label>
                <Form.Control  placeholder="Name"  type="text" ref={nameRef} required className="input--lg" />
              </Form.Group>
              <Form.Group id="email">
                <Form.Label className="visually-hidden">Email</Form.Label>
                <Form.Control placeholder="Email" type="email" ref={emailRef} required className="input--lg" />
              </Form.Group>
              <Form.Group id="password">
                <Form.Label className="visually-hidden">Password</Form.Label>
                <Form.Control placeholder="Password"  type="password" ref={passwordRef} required className="input--lg" />
              </Form.Group>
              <Form.Group id="password-Confirmation">
                <Form.Label className="visually-hidden">passwordConfirmation</Form.Label>
                <Form.Control
                  placeholder="Confirm Password"
                  type="password"
                  ref={passwordConfirmRef}
                  required
                  className="input--lg"
                />
              </Form.Group>
              <button disabled={loading} className="btn--primary" type="submit">
                Sign Up
              </button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          <p>Already have an account?</p>
          <p className="login-page-link"><Link to="/">Log In</Link></p>
        </div>
      </div>
    </>
  )
}
