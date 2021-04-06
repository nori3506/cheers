import React from 'react'
import { SpinnerCircular } from 'spinners-react'

export default function Loading() {
  return (
    <div className="spinner-grid-wrapper">
      <SpinnerCircular
        size={50}
        thickness={180}
        speed={150}
        color="#de9e48"
        secondaryColor="black"
      />
    </div>
  )
}
