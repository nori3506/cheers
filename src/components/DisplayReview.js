//import React from "react";
import { db } from '../firebase/index';
import React, {useState, useEffect} from 'react';
import { auth } from '../firebase/index';


const DisplayReview = () => {
  const [reviews, setReviews] = useState([]);
  const [orderedReviews, setOrderedReviews] = useState([]);
  const pathName = window.location.pathname;
  const fbPathName = pathName.replace("/shop", "shops")
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

      //自分が書いたコード、エラーが起きないようコメントアウトしておきます
      /*auth.onAuthStateChanged(function(user) {
        if (user) {
          var userUidRef = user.uid;
          // User is signed in.
          userUidRef = db.collection('users').doc(userUidRef);
          console.log(reviews);
          var userName = userUidRef.get().then((doc) => {
            if(doc.exists) {
              console.log(doc.data().name);
              return doc.data().name
            }
          })
          for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].user.name == userName) {
              let userReviews = reviews.splice(i);
              reviews.unshift(userReviews);  
              console.log(reviews);       
            } else {
              console.log("error");
              console.log(reviews[i].user.name);
              console.log(userName);
            }
            
            
          }
        } else {
          console.log('No user is signed in');
        }
      });*/
  

  }, [])



 

  
  

  const reviewItems = reviews.map((review) => {
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
      No reviews are found
      </div>
    )
  }


}

export default DisplayReview;
