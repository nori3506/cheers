//import React from "react";
import { db, storage } from '../firebase/index';
import React, {useState, useEffect} from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ButtonInput } from './UIkit'
import firebase from "firebase/app";


const DisplayReview = () => {
  const [reviews, setReviews] = useState([]);
  const [shops, setShops] = useState([]);
  const pathName = window.location.pathname;
  const fbPathName = pathName.replace("/shop", "shops")
  const { currentUser } = useAuth()
  const shopRef = db.doc(fbPathName);
  const userRef = db.collection('users')
  const storage = firebase.storage();


  useEffect(() => {
        shopRef.get().then(function(shop) {
          if (shop.exists) {
            setShops(shop.data().name);

          db.collection("reviews").where("shop", "==", shopRef)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(review) {
              userRef.doc(review.data().user.id)
              .get()
              .then(snapshot => { 
                if(review.data().fullPath) {
                  var pathReference = storage.ref(review.data().fullPath);
                  pathReference.getDownloadURL().then(url => {
                    setReviews((reviews) => [...reviews, { ...review.data(), shop: shop.data(), user: snapshot, ref: review.ref, img: url }])
                  })   
                }else {
                  setReviews((reviews) => [...reviews, { ...review.data(), shop: shop.data(), user: snapshot, ref: review.ref, img: "doesNotExist" }])
                }
                
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

        {(() => {
          if (review.img != "doesNotExist") {
            return (
                <img src={review.img} className="review-img" />
            )
          }
        })()}

        <div>
          <h2 className="u-text-small">{review.drink_name}</h2>
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
          <p class="user-name">{review.user.data().name}</p>
          <div class="delete-edit-wrapper">
          {(() => {
            if (currentUser.uid == review.user.id) {
              return (
                <>
                  <Link to={'/review/edit/' + review.ref.id} className="edit-button">Edit</Link>
                  <ButtonInput label={"Delete"} onClick={() => handleDelete(review)} />
                </>
              )
            }
          })()}
          </div>
        </div>
      </div>
    )
  })


  if (reviewItems.length) {
    return (
      <div className="Review">
        <div class="shop-basic-info">
            <h2>{shops}</h2>
        </div>
        <div className="review-wrapper">
          {reviewItems}
        </div>
      </div>
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
