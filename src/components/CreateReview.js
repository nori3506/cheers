import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import ReactStars from 'react-rating-stars-component'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { db, storage } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import Imageupload from './imageUpload'

const reviewsRef = db.collection('reviews')
const shopsRef = db.collection('shops')
const usersRef = db.collection('users')

export default function CreateReview() {
  const { currentUser } = useAuth()

  const history = useHistory()

  const [drinkName, setDrinkName] = useState('')
  const [price, setPrice] = useState(0)
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

  const updateNetwork = () => setNetwork(window.navigator.onLine)

  useEffect(() => {
    window.addEventListener('offline', updateNetwork)
    window.addEventListener('online', updateNetwork)
    return () => {
      window.removeEventListener('offline', updateNetwork)
      window.removeEventListener('online', updateNetwork)
    }
  })

  const userRef = usersRef.doc(currentUser.uid)
  let fullPath = ''

  function reviewRegisterForExistShop(existShop) {
    const randomPhotoId = Math.random().toString(32).substring(2)

    if (image !== null) {
      fullPath = 'reviewPhoto/' + randomPhotoId + image.name
      storage.ref().child(fullPath).put(image)
    }

    reviewsRef
      .doc()
      .set({
        drink_name: drinkName,
        price,
        rating,
        comment,
        drink_category: drinkCategory,
        shop_category: shopCategory,
        user: userRef,
        shop: existShop,
        fullPath,
      })
      .then(() => history.push('/shop/' + existShop.id))
  }

  function reviewRegisterForNewShop(formatGeoCode) {
    const randomShopId = Math.random().toString(32).substring(2)
    const randomPhotoId = Math.random().toString(32).substring(2)
    const shopRef = shopsRef.doc(randomShopId)

    if (image !== null) {
      fullPath = 'reviewPhoto/' + randomPhotoId + image.name
      storage.ref().child(fullPath).put(image)
    }

    shopRef.set({
      name: shopName,
      address: formattedAddress,
      geocode: formatGeoCode,
      category: shopCategory,
    })

    reviewsRef
      .doc()
      .set({
        drink_name: drinkName,
        price,
        rating,
        comment,
        drink_category: drinkCategory,
        shop_category: shopCategory,
        user: userRef,
        shop: shopRef,
        fullPath,
      })
      .then(() => history.push('/shop/' + randomShopId))
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

  const handleDrinkNameChange = e => setDrinkName(e.target.value)
  const handleCommentChange = e => setComment(e.target.value)
  const handleDrinkCategoryChange = e => setDrinkCategory(e.target.value)
  const handleShopCategoryChange = e => setShopCategory(e.target.value)
  const handlePriceChange = e => setPrice(parseFloat(e.target.value))
  const handleRatingChange = e => setRating(parseInt(e))
  const handlePlaceChange = address => {
    setShopName(address.split(',', 1)[0])
    setAddress(address)
    geocodeByAddress(address)
      .then(results => {
        setFormattedAddress(results[0].formatted_address)
        return getLatLng(results[0])
      })
      .then(latlng => setGeoCode([latlng.lat, latlng.lng]))
      .catch(err => console.error('Error', err))
  }
  const handleImageChange = e => {
    setImage(e.target.files[0])
    setPreview(window.URL.createObjectURL(e.target.files[0]))
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <form className="review_form" onSubmit={handleSubmit}>
        <input
          required
          className="drink_name"
          placeholder="What did you drink?"
          name="drink_name"
          onChange={handleDrinkNameChange}
        />

        <PlacesAutocomplete
          value={address}
          onChange={handlePlaceChange}
          onSelect={handlePlaceChange}
        >
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
          <select required className="shop_category" onChange={handleShopCategoryChange}>
            <option value="">What is the type of the shop?</option>
            {placeCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <Imageupload onChange={handleImageChange} photoURL={preview} />

        <div className="select-container">
          <select required className="drink_category" onChange={handleDrinkCategoryChange}>
            <option value="">What is the type of the drink?</option>
            {drinkCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <input
          required
          className="price"
          max="99999"
          min="0"
          step="0.5"
          type="number"
          onChange={handlePriceChange}
          placeholder="How much did it cost?"
        />

        <ReactStars
          count={5}
          value={rating}
          onChange={handleRatingChange}
          size={24}
          activeColor="#de9e48"
        />

        <textarea
          className="comment"
          placeholder="Please write a review"
          name="comment"
          rows="4"
          cols="40"
          onChange={handleCommentChange}
        />

        <button className="btn--primary" type="submit" disabled={isCreating ? true : false}>
          {isCreating ? 'Creating...' : 'Submit'}
        </button>
      </form>
    </>
  )
}
