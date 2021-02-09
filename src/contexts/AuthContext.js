import React, { useContext, useState, useEffect } from 'react'
import { db, auth, FirebaseTimestamp } from '../firebase/index'

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  function signup(email, password, name) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then(result => {
        const user = result.user
        if (user) {
          user.updateProfile({
            displayName: name
          })
          const uid = user.uid
          const timestamp = FirebaseTimestamp.now()
          const userInitialData = {
            uid: uid,
            name: name,
            created_at: timestamp,
            updated_at: timestamp,
          }
          db.collection('users').doc(uid).set(userInitialData)
        }
    })
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email,password)
  }

  function logout() {
    return auth.signOut()
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  

  const value = {
    currentUser,
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children }
    </AuthContext.Provider>
  )
}
