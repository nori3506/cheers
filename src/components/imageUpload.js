import React, { useCallback, useState, useEffect } from 'react'

export default function Imageupload(props) {

  return (
    <>
      {/* <p>images</p> */}
      <img src={props.photoURL} className="w-100" />
      <input className= 'drink_image' type={"file"} onChange={ props.onChange }/>
    </>
  )
}
