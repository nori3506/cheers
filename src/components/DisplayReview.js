//import React from "react";
import { db } from '../firebase/index';
import React, {useState, useEffect} from 'react';

var pathName = window.location.pathname;
var fbPathName = pathName.replace("/shop", "shops")
var dataContainer = [];


var comment;
var date;
var drinkName;
var price;
var rating;
var user;



class review {
	constructor(comment, date, drinkName, price, rating, shop, user) {
		this.comment = comment;
		this.date = date;
		this.drinkName = drinkName;
		this.price = price;
        this.rating = rating;
        this.shop = shop;
        this.user = user;
	}
}




var GetData = new Promise(function(resolve){
    var docRef = db.doc(fbPathName);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var shop =  doc.data().name;
          
            db.collection("reviews").where("shop", "==", docRef)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {

                    comment = doc.data().comment;
                    date = doc.data().date;
                    drinkName = doc.data().drink_name;
                    price = doc.data().price;
                    rating = doc.data().rating;

                    const reviewObj = new review (comment, date, drinkName, price, rating, shop, user);
                            dataContainer.push(reviewObj);
                            console.log(dataContainer);

                    var userRef = doc.data().user.path;
                    var userCollection = db.doc(userRef);
                    userCollection.get().then(function(doc) {
                        if (doc.exists) {
                            user = doc.data().name;
                            console.log(user);
                            
                        } else {
                            console.log("No such document!");
                        }
                    }).catch(function(error) {
                        console.log("Error getting document:", error);
                    });

                    resolve(dataContainer);
                    
                                       
                });
            })
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

})






const DisplayReview = () => {
    const [data, setTest] = useState();


    useEffect(() => {

        var commentTest = () => {
            GetData.then(() => {
                const fetchedComment = dataContainer[0].comment;
                setTest(fetchedComment);
               
            }).catch((e) => {
                console.error(e);
            })
            }
            commentTest();
        })

    return (
        <div>
            <p>this is a comment {data}!</p>
            <p>Hello this is test {data}!</p>
        </div>
    )
}

export default DisplayReview;



