import React from 'react'
import { SpinnerCircular } from 'spinners-react'

export default function Loading() {
  return (
    <div className="spinner-grid">
      <SpinnerCircular
        size={70}
        thickness={130}
        speed={117}
        color="#de9e48"
        secondaryColor="black"
      />
    </div>
  )
}
