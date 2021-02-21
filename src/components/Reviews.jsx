import React from 'react';
import { Link } from 'react-router-dom'
import { ButtonInput } from './UIkit'
import { db } from '../firebase/index'

const Reviews = (props) => {
  
  function handleDelete(review) {
    if (window.confirm('Are you Sure to Delete This Review?')) {
      db.collection('reviews').get().then((snapshot) => {
        snapshot.forEach(doc => {
          if (doc.id === review.ref.id) {
            db.collection('reviews').doc(doc.id).delete();
          }
        })
      })
    }
  }
  
  const reviewItems = props.reviews.map((review, i) => {
    return (
      <div className="reviews-background reviews-area">
        <h2 className="u-text-small">{review.drink_name} <span className="normal-font-weight">at</span> {review.shop.name}</h2>
        <li>{review.price} CAD</li>
        <li>{review.rating}</li>
        <li>{review.drink_category}</li>
        <p>"{review.comment}"</p>
        <Link to="/" className="blue-color">Edit</Link>
        <ButtonInput label={"Delete"} onClick={() =>handleDelete(review)}/>
      </div>
    )
  })
  if (reviewItems.length) {
    return (
      <ul>
        {reviewItems}
      </ul>
    )
  } else {
    return(
      <div className="reviews-background u-text-center">
        Your Reviews were not found
      </div>
    )
  }
}

export default Reviews;
