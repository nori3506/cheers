//import React from "react";
import { db } from '../firebase/index';
import React, {useState, useEffect} from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ButtonInput } from './UIkit'

const DisplayReview = () => {
  const [reviews, setReviews] = useState([]);
  const [orderedReviews, setOrderedReviews] = useState([]);
  const pathName = window.location.pathname;
  const fbPathName = pathName.replace("/shop", "shops")
  const { currentUser } = useAuth()
  const shopRef = db.doc(fbPathName);
  const userRef = db.collection('users')

  useEffect(() => {
        shopRef.get().then(function(shop) {
          if (shop.exists) {
          db.collection("reviews").where("shop", "==", shopRef)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(review) {
              userRef.doc(review.data().user.id)
              .get()
              .then(snapshot => {           
                setReviews((reviews) => [...reviews, { ...review.data(), shop: shop.data(), user: snapshot, ref: review.ref }])
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


  const reviewItems = reviews.map((review) => {
    return (
      <div className="reviews-background reviews-area">
        <h2 className="u-text-small">{review.drink_name}</h2>
        <li>{review.user.data().name}</li>
        <li>{review.price} CAD</li>
        <li>{review.rating}</li>
        <li>{review.drink_category}</li>
        <p>"{review.comment}"</p>
        {(() => {
          if (currentUser.uid == review.user.id) {
            return (
              <>
                <Link to={'/review/edit/' + review.ref.id} className="blue-color">Edit</Link>
                <ButtonInput label={"Delete"} onClick={() => handleDelete(review)} />
              </>
            )
          }
        })()}
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
      No reviews are found
      </div>
    )
  }
}

export default DisplayReview;
