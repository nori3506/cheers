import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { db, storage } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import Imageupload from './imageUpload'
import ReactStars from 'react-rating-stars-component'
import { Alert } from 'react-bootstrap'

const shopsRef = db.collection('shops')

export default function CreateReview() {
  const [drinkName, setDrinkName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [drinkCategory, setDrinkCategory] = useState('Others')
  const [shopCategory, setShopCategory] = useState('Restaurant')
  const [shopName, setShopName] = useState('')
  const [geoCode, setGeoCode] = useState([])
  const [address, setAddress] = useState('')
  const [formattedAddress, setFormattedAddress] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isOnline, setNetwork] = useState(window.navigator.onLine)
  const history = useHistory()

  let currentUserUid = firebase.auth().currentUser.uid
  let fullPath = ''

  const updateNetwork = () => {
    setNetwork(window.navigator.onLine)
  }

  useEffect(() => {
    window.addEventListener('offline', updateNetwork)
    window.addEventListener('online', updateNetwork)
    return () => {
      window.removeEventListener('offline', updateNetwork)
      window.removeEventListener('online', updateNetwork)
    }
  })

  function reviewRegisterForExistShop(existShop) {
    let userRef = db.collection('users').doc(currentUserUid)
    const randomPhotoId = Math.random().toString(32).substring(2)
    if (image !== null) {
      fullPath = 'reviewPhoto/' + randomPhotoId + image.name
      let storageRef = storage.ref().child(fullPath)
      storageRef.put(image)
    }

    db.collection('reviews').doc().set({
      drink_name: drinkName,
      price: price,
      rating: rating,
      comment: comment,
      drink_category: drinkCategory,
      shop_category: shopCategory,
      user: userRef,
      shop: existShop,
      fullPath: fullPath,
    }).then(() => {
      history.push('/shop/' + existShop.id);
  })
  }

  function reviewRegisterForNewShop(formatGeoCode) {
    let randomID = Math.random().toString(32).substring(2)
    const randomPhotoId = Math.random().toString(32).substring(2)
    if (image !== null) {
      fullPath = 'reviewPhoto/' + randomPhotoId + image.name
      let storageRef = storage.ref().child(fullPath)
      storageRef.put(image)
    }
    db.collection('shops').doc(randomID).set({
      name: shopName,
      address: formattedAddress,
      geocode: formatGeoCode,
      category: shopCategory,
    })
    let shopRef = db.collection('shops').doc(randomID)
    let userRef = db.collection('users').doc(currentUserUid)
    db.collection('reviews').doc().set({
      drink_name: drinkName,
      price: price,
      rating: rating,
      comment: comment,
      drink_category: drinkCategory,
      shop_category: shopCategory,
      user: userRef,
      shop: shopRef,
      fullPath: fullPath,
    }).then(() => {
     history.push('/shop/' + randomID);
  })

  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsCreating(true)
    try {
      let formatGeoCode = new firebase.firestore.GeoPoint(Number(geoCode[0]), Number(geoCode[1]))
      await shopsRef.get().then(querySnapshot => {
        let isExistShop = false
        let existShop
        querySnapshot.forEach(shop => {
          if (
            formatGeoCode.latitude === shop.data().geocode.latitude &&
            formatGeoCode.longitude === shop.data().geocode.longitude
          ) {
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
      setError('Please set correct Shop Name')
    } finally {
      setIsCreating(false)
    }
  }

  const inputDrinkName = event => {
    setDrinkName(event.target.value)
  }

  const inputComment = event => {
    setComment(event.target.value)
  }

  // const inputImage = event => {
  //   setImage(event.target.files[0])
  // }

  const inputDrinkCategory = event => {
    setDrinkCategory(event.target.value)
  }

  const inputShopCategory = event => {
    setShopCategory(event.target.value)
  }

  const inputPrice = event => {
    setPrice(parseFloat(event.target.value))
  }

  const inputRating = event => {
    setRating(parseInt(event))
  }

  const handleChange = address => {
    setShopName(address.split(',', 1)[0])
    setAddress(address)
    geocodeByAddress(address)
      .then(results => {
        setFormattedAddress(results[0].formatted_address)
        return getLatLng(results[0])
      })
      .then(latlng => {
        console.log(latlng)
        setGeoCode([latlng.lat, latlng.lng])
      })
      .catch(error => console.error('Error', error))
  }

  const handleImageChange = event => {
    const { files } = event.target
    setImage(event.target.files[0])
    setPreview(window.URL.createObjectURL(files[0]))
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <form className="review_form" onSubmit={handleSubmit}>
        {/* <p>Drink name*</p> */}
        <input
          required
          className="drink_name"
          placeholder="What did you drink?"
          name="drink_name"
          onChange={inputDrinkName}
        />

        {/* <p>Shop*</p> */}
        <PlacesAutocomplete value={address} onChange={handleChange} onSelect={handleChange}>
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div className="shop_name">
              <input
                {...getInputProps({
                  placeholder: 'Where did you drink it?',
                  className: 'location-search-input',
                })}
                required
                disabled={!isOnline}
              />
              <div className="autocomplete-dropdown-container">
                {loading && <div>Loading...</div>}
                {suggestions.map(suggestion => {
                  const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item'
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' }
                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style,
                      })}
                    >
                      <strong>{suggestion.formattedSuggestion.mainText}</strong>{' '}
                      <small>{suggestion.formattedSuggestion.secondaryText}</small>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>

        {!isOnline ? (
          <p className="helper-text--error">
            Please connect to the internet to get suggestions for this input.
          </p>
        ) : null}

        <div className="select-container">
          <select required className="shop_category" onChange={inputShopCategory}>
            <option value="">What is the type of the shop?</option>
            {placeCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <Imageupload onChange={handleImageChange} photoURL={preview} />
        {/* <p>Drink category*</p> */}
        <div className="select-container">
          <select required className="drink_category" onChange={inputDrinkCategory}>
            <option value="">What is the type of the drink?</option>
            {drinkCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <input
          className="price"
          max="99999"
          min="0"
          step="0.5"
          type="number"
          onChange={inputPrice}
          placeholder="How much did it cost?"
        />

        <ReactStars
          count={5}
          value={rating}
          onChange={inputRating}
          size={24}
          activeColor="#de9e48"
        />

        <textarea
          className="comment"
          placeholder="Please write a review"
          name="comment"
          rows="4"
          cols="40"
          onChange={inputComment}
        />

        <button className="btn--primary" type="submit" disabled={isCreating ? true : false}>
          {isCreating ? 'Creating...' : 'Submit'}
        </button>
      </form>
    </>
  )
}
