//import React from "react";
import { db } from '../firebase/index';
import React, {useState, useEffect} from 'react';

const DisplayReview = () => {
  const [reviews, setReviews] = useState([]);
  let pathName = window.location.pathname;
  let fbPathName = pathName.replace("/shop", "shops")
  let shopRef = db.doc(fbPathName);
  let userRef = db.collection('users')

  useEffect(() => {
    shopRef.get().then(function(shop) {
      if (shop.exists) {
      db.collection("reviews").where("shop", "==", shopRef)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(review) {
          userRef.doc(review.data().user.id).get().then(snapshot => {
            setReviews((reviews) => [...reviews, { ...review.data(), shop: shop.data(), user: snapshot.data() }])
          }).catch(function(error) {
             console.log("Error getting document:", error);
          });										 
        });
      })
    } else {
      console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
  
  }, [])

  const reviewItems = reviews.map((review, i) => {
    return (
      <div className="reviews-background reviews-area">
        <h2 className="u-text-small">{review.drink_name}</h2>
        <li>{review.user.name}</li>
        <li>{review.price} CAD</li>
        <li>{review.rating}</li>
        <li>{review.drink_category}</li>
        <p>"{review.comment}"</p>
        {/* <Link to={'/review/edit/' + review.ref.id} className="blue-color">Edit</Link>
        <ButtonInput label={"Delete"} onClick={() =>handleDelete(review)}/> */}
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

export default DisplayReview;
