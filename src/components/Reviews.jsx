import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ButtonInput } from './UIkit'
import { db } from '../firebase/index'
const reviewsRef = db.collection('reviews')

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    reviewsRef.get().then((snapshot) => {
      snapshot.forEach((review) => {
        if (review?.data()?.user?.id == currentUser.uid) {
          db.collection('shops').doc(review.data().shop.id).get().then(
            snapshot => {
              const shop = snapshot.data()
              setReviews((reviews) => [...reviews, { ref: review.ref, ...review.data(), shop: shop }])
            }
          )
        }
      })
    })
  }, [])

  
  function handleDelete(review) {
    if (window.confirm('Are you Sure to Delete This Review?')) {
      db.collection('reviews').get().then((snapshot) => {
        snapshot.forEach(doc => {
          if (doc.id === review.ref.id) {
            db.collection('reviews').doc(doc.id).delete();
            const newReviews = reviews.filter(review => review.ref.id !== doc.id)
            setReviews(newReviews)
          }
        })
      })
    }
  }
  
  const reviewItems = reviews.map((review, i) => {
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
