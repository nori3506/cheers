import React, { useCallback, useState, useEffect } from 'react'

export default function Imageupload(props) {

  return (
    <>
      {/* <p>images</p> */}
      <input className= 'drink_image' type={"file"} onChange={ props.onChange }/>
      <img src={props.photoURL} className="w-100" />
    </>
  )
}
