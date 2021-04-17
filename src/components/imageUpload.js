import React from 'react'

export default function Imageupload(props) {
  return (
    <>
      {/* <p>images</p> */}
      <div className="image_wrapper">
        <input className="drink_image" type={'file'} onChange={props.onChange} />
        {(() => {
            if (!props.photoURL === "") {
              return <img src={props.photoURL} alt='drinkimage' className="w-100" />
            }
        })()}
      </div>
    </>
  )
}
