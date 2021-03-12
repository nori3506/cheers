import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from "firebase/app";
import "firebase/firestore";
import { db, storage } from '../firebase/index'
import Automap from "./Automap"
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Imageupload from './imageUpload'

const shopsRef = db.collection('shops')

export default function CreateReview() {
  const [drinkName, setDrinkName] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [drinkCategory, setDrinkCategory] = useState("Others");
  const [shopCategory, setShopCategory] = useState("");
  const [geoCode, setGeoCode] = useState([]);
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("")
  const [message, setMessage] = useState('');
  const history = useHistory();

  let currentUserUid = firebase.auth().currentUser.uid;
  let fullPath = "";

  function reviewRegisterForExistShop(existShop){
    let userRef = db.collection('users').doc(currentUserUid)
    const randomPhotoId = Math.random().toString(32).substring(2)
    if (image !== null) {
      fullPath = "reviewPhoto/" + randomPhotoId + image.name;
      let storageRef = storage.ref().child(fullPath);
      storageRef.put(image)
    }

    db.collection("reviews").doc().set({
      drink_name: drinkName,
      price: price,
      rating: rating,
      comment: comment,
      drink_category: drinkCategory,
      shop_category: shopCategory,
      user: userRef,
      shop: existShop,
      fullPath: fullPath,
    })
    history.push( '/shop/'+existShop.id)
  }

  function reviewRegisterForNewShop(formatGeoCode) {
    let randomID = Math.random().toString(32).substring(2)
    const randomPhotoId = Math.random().toString(32).substring(2)
    if (image !== null) {
      fullPath = "reviewPhoto/" + randomPhotoId + image.name;
      let storageRef = storage.ref().child(fullPath);
      storageRef.put(image)
    }
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
      drink_category: drinkCategory,
      shop_category: shopCategory,
      user: userRef,
      shop: shopRef,
      fullPath: fullPath,
    })
    history.push( '/shop/'+randomID)
  }

  function handleSubmit(e) {
    e.preventDefault()
    let formatGeoCode = new firebase.firestore.GeoPoint(Number(geoCode[0]), Number(geoCode[1]));
    try {
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
          reviewRegisterForExistShop(existShop)
        } else {
          reviewRegisterForNewShop(formatGeoCode)
        }
      })
    } catch {
      console.log(e)
    }

  }

  const inputDrinkName = (event) =>{
    setDrinkName(event.target.value)
  }

  const inputComment = (event) =>{
    setComment(event.target.value)
  }

  const inputImage = (event) => {
    setImage(event.target.files[0])
  }

  const inputDrinkCategory = (event) =>{
    setDrinkCategory(event.target.value)
  }

  const inputShopCategory = (event) =>{
    setShopCategory(event.target.value)
  }

  const inputPrice = (event) =>{
    setPrice(parseInt(event.target.value))
  }

  const inputRating = (event) =>{
    setRating(parseInt(event.target.value))
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

  const handleImageChange = event => {
    const { files } = event.target;
    setImage(event.target.files[0])
    setPreview(window.URL.createObjectURL(files[0]));
  }

  return (
    <>
      <form className ='review_form' onSubmit={handleSubmit} >
        {/* <p>Drink name*</p> */}
        <input required  className= 'drink_name' placeholder='What did you drink?'name="drink_name" onChange={inputDrinkName} />

        <select  className= 'shop_category' onChange={inputShopCategory}>
          <option value="">What is the type of the shop?</option>
          {placeCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>


        {/* <p>Shop*</p> */}
        <PlacesAutocomplete
          value={address}
          onChange={handleChange}
          onSelect={handleChange}

        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div  className ='shop_name'>
              <input
                {...getInputProps({
                  placeholder: 'Where did you drink it?',
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
        <Imageupload onChange={ handleImageChange } photoURL={preview} />
        {/* <p>Drink category*</p> */}
        <select  className= 'drink_category' onChange={inputDrinkCategory}>
          <option value="">What is the type of the drink?</option>
          {drinkCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {/* <p>Price</p> */}
        <input  className= 'price' maxlength="5" onChange={inputPrice}　placeholder='How much did it cost?' />
        {/* <p>Rating</p> */}
        <input className= 'rating' placeholder='Rate the drink' type='number' max="5" min='1' name="rating" onChange={inputRating} />
        {/* <p>Comment</p> */}
        <textarea className= 'comment' placeholder='Please write a review' name="comment" rows="4" cols="40" onChange={inputComment} />
        <input
        className= 'submit'
          type='submit'
          value='Submit'
          style={{ display: "block" }}
        />
      </form>
    </>
  )
}
