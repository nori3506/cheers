import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ButtonInput } from './UIkit'
import { db } from '../firebase/index'
import firebase from "firebase/app";
const reviewsRef = db.collection('reviews')
const storage = firebase.storage();

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    reviewsRef.get().then((snapshot) => {
      snapshot.forEach((review) => {
        if (review?.data()?.user?.id == currentUser.uid) {
          db.collection('shops').doc(review.data().shop.id).get().then(
            snapshot => {
              if(review.data().fullPath) {
                var pathReference = storage.ref(review.data().fullPath);
                pathReference.getDownloadURL().then(url => {
                  const shop = snapshot.data()
              setReviews((reviews) => [...reviews, { ref: review.ref, ...review.data(), shop: shop, img: url }])
                })
              }else {
                const shop = snapshot.data()
              setReviews((reviews) => [...reviews, { ref: review.ref, ...review.data(), shop: shop, img: "doesNotExist" }])

              }
              
            }
          )
        }
      })
    })
  }, [])



  function handleDelete(review) {
    const promises = []
    if (window.confirm('Are you Sure to Delete This Review?')) {
      db.collection('reviews').get().then((snapshot) => {
         snapshot.forEach(doc => {
           if (doc.id === review.ref.id) {
             promises.push(db.collection('reviews').doc(doc.id).delete());
             Promise.all(promises).then(() => {
              const newReviews = reviews.filter(review => review.ref.id !== doc.id)
              setReviews(newReviews)
              const shopDocRef = db.collection('shops').doc(doc.data().shop.id)
              let query = db.collection('reviews').where("shop", "==", shopDocRef)
              query.get().then(querySnapshot => {
                if (querySnapshot.empty) {
                  shopDocRef.delete()
                }
              })
              .catch(function (error) {
                console.log("Error getting documents: ", error);
              })
            })
          }
        })
      })
    }
  }
  
  const reviewItems = reviews.map((review, i) => {
    return (
      <div className="reviews-background reviews-area">

        {(() => {
          if (review.img != "doesNotExist") {
            return (
                <img src={review.img} className="review-img" />
            )
          }
        })()}

        <div>
          <h2 className="u-text-small">{review.drink_name}&#160;<span className="normal-font-weight">at</span> {review.shop.name}</h2>
          <p class="category">{review.drink_category}</p>
          <p class="price">{review.price} CAD</p>
            {(() =>{
               var rating = review.rating;
               var star = "";
               var hollowStars = "";
               for(var i = 0; i < rating ; i++ ) {
                  star = star + "★";
               }
               var noRating = 5 - rating;
               for(var i = 0; i < noRating; i++) {
                  hollowStars = hollowStars + "☆";
               }
               return (
                <p class="rating">{star}{hollowStars}</p>
              )
             })()}
        </div>

        <p class="comment"><span>"</span>{review.comment}<span>"</span></p>

        <div class="bottom-row">
          <div class="delete-edit-wrapper">
            <Link to={'/review/edit/' + review.ref.id} className="edit-button">Edit</Link>
            <ButtonInput label={"Delete"} onClick={() =>handleDelete(review)}/>
          </div>
        </div>

      </div>
    )
  })
  if (reviewItems.length) {
    return (
      <div className="review-wrapper">
        {reviewItems}
      </div>
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
