import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from "firebase/app";
import "firebase/firestore";
import { db, storage } from '../firebase/index'
import Automap from "./Automap"
import drinkCategories from '../lib/drinkCategories'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Imageupload from './imageUpload'

const shopsRef = db.collection('shops')

export default function CreateReview() {
  const [drinkName, setDrinkName] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState();
  const [comment, setComment] = useState("");
  const [drinkCategory, setDrinkCategory] = useState("");
  const [shopName, setShopName] = useState("");
  const [geoCode, setGeoCode] = useState([]);
  const [address, setAddress] = useState("");
  let currentUserUid = firebase.auth().currentUser.uid;

  function handleSubmit(e) {
    e.preventDefault()
    let formatGeoCode = new firebase.firestore.GeoPoint(Number(geoCode[0]), Number(geoCode[1]));
    shopsRef.get().then(querySnapshot => {
      let isExistShop = false
      let existShop
      querySnapshot.forEach(shop => {
        if (formatGeoCode.latitude === shop.data().geocode.latitude &&
          formatGeoCode.longitude === shop.data().geocode.longitude) {
          isExistShop = true
          existShop = shop.ref
        }
      })
      if (isExistShop) {
        let userRef = db.collection('users').doc(currentUserUid)
        db.collection("reviews").doc().set({
          drink_name: drinkName,
          price: price,
          rating: rating,
          comment: comment,
          // image: comment,
          drink_category: drinkCategory,
          user: userRef,
          shop: existShop,
        }).catch(e =>{
          console.log(e)
        })
      } else {
        let randomID = Math.random().toString(32).substring(2)
        db.collection('shops').doc(randomID).set({
          name: address,
          geocode: formatGeoCode
        })
        let shopRef = db.collection('shops').doc(randomID)
        let userRef = db.collection('users').doc(currentUserUid)
        db.collection("reviews").doc().set({
          drink_name: drinkName,
          price: price,
          rating: rating,
          comment: comment,
          // image: comment,
          drinkcategory: drinkCategory,
          user: userRef,
          shop: shopRef,
        }).catch(e =>{
          console.log(e)
        })
      }
    })
  }

  const inputDrinkName = (event) =>{
    setDrinkName(event.target.value)
  }

  const inputComment = (event) =>{
    setComment(event.target.value)
  }

  const inputDrinkCategory = (event) =>{
    setDrinkCategory(event.target.value)
  }

  const inputPrice = (event) =>{
    setPrice(event.target.value)
  }

  const inputRating = (event) =>{
    setRating(event.target.value)
  }

  const handleChange = address => {
    setAddress(address);
    geocodeByAddress(address)
      .then(results => 
        getLatLng(results[0])
      )
      .then((latlng) => {
        setGeoCode([latlng.lat, latlng.lng])
      })
      .catch(error => console.error('Error', error));
  };

  return (
    <>
      <form onSubmit={handleSubmit} >
        <p>Drink name*</p>
        <input required name="drink_name" onChange={inputDrinkName} />
        {/* <p>images</p>
        <input type='file' accept=".png, .jpg, .jpeg" name="images" onChange={image} /> */}
        <p>Shop*</p>
        <PlacesAutocomplete
          value={address}
          onChange={handleChange}
          onSelect={handleChange}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: 'Search Places ...',
                  className: 'location-search-input',
                })}
              />
              <div className="autocomplete-dropdown-container">
                {loading && <div>Loading...</div>}
                {suggestions.map(suggestion => {
                  const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style,
                      })}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
        <Imageupload　/>
        <p>Drink category*</p>
        <select  onChange={inputDrinkCategory}>
          <option value="">Select drink category</option>
          {drinkCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <p>Price</p>
        <input onChange={inputPrice} />
        <p>Rating</p>
        <input type='number' max="5" min='1' name="rating" onChange={inputRating} />
        <p>Comment</p>
        <textarea name="comment" rows="4" cols="40" onChange={inputComment} />
        <input
          type='submit'
          value='Submit'
          style={{ display: "block" }}
        />
      </form>
    </>
  )
}
