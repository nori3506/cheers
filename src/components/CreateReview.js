import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("")
  const [photoURL, setPhotoURL] = useState("");
  const [message, setMessage] = useState('');
  const history = useHistory();

  let currentUserUid = firebase.auth().currentUser.uid;

  function reviewRegisterForExistShop(existShop){
    let userRef = db.collection('users').doc(currentUserUid)
    const randomPhotoId = Math.random().toString(32).substring(2)
    const fullPath = "reviewPhoto/" + randomPhotoId + image.name
    let storageRef = storage.ref().child(fullPath);
    storageRef.put(image)
    
    db.collection("reviews").doc().set({
      drink_name: drinkName,
      price: price,
      rating: rating,
      comment: comment,
      drink_category: drinkCategory,
      user: userRef,
      shop: existShop,
      fullPath: fullPath,
    })
      history.push( '/shop/'+existShop.id)
  }

  function reviewRegisterForNewShop(formatGeoCode) {
    let randomID = Math.random().toString(32).substring(2)
    db.collection('shops').doc(randomID).set({
      name: address,
      geocode: formatGeoCode
    })
    let shopRef = db.collection('shops').doc(randomID)
    let userRef = db.collection('users').doc(currentUserUid)
    const randomPhotoId = Math.random().toString(32).substring(2)
    const fullPath = "reviewPhoto/" + randomPhotoId + image.name
    let storageRef = storage.ref().child(fullPath);
    storageRef.put(image)

    db.collection("reviews").doc().set({
      drink_name: drinkName,
      price: price,
      rating: rating,
      comment: comment,
      drinkcategory: drinkCategory,
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

  const handleImageChange = event => {
    const { files } = event.target;
    setImage(event.target.files[0])
    setPreview(window.URL.createObjectURL(files[0]));
  }

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
        <Imageupload onChange={ handleImageChange } photoURL={preview} />
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
