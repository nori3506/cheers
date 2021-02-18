import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Login from '../templates/Login'
import { Link } from 'react-router-dom'
import { db } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'

const shopsRef = db.collection('shops')
const reviewsRef = db.collection('reviews')

export default function Home() {
  const { currentUser } = useAuth()

  const [drink, setDrink] = useState('')
  const [place, setPlace] = useState('')
  const [priceMax, setPriceMax] = useState(1000)
  const [priceMin, setPriceMin] = useState(0)
  const [drinkCategory, setDrinkCategory] = useState('')
  const [placeCategory, setPlaceCategory] = useState('')
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])

  const handleDrinkChange = e => setDrink(e.target.value.toLowerCase())
  const handleDrinkCategoryChange = e => setDrinkCategory(e.target.value)
  const handlePlaceChange = e => setPlace(e.target.value.toLowerCase())
  const handlePlaceCategoryChange = e => setPlaceCategory(e.target.value)
  const handlePriceMaxChange = e => {
    const newPriceMax = Number(e.target.value)
    if (newPriceMax >= priceMin) {
      setPriceMax(newPriceMax)
    } else {
      setPriceMax(newPriceMax)
      setPriceMin(newPriceMax)
    }
  }
  const handlePriceMinChange = e => {
    const newPriceMin = Number(e.target.value)
    if (newPriceMin <= priceMax) {
      setPriceMax(newPriceMin)
    } else {
      setPriceMax(newPriceMin)
      setPriceMin(newPriceMin)
    }
  }
  const handleSearch = e => {
    e.preventDefault()
    setReviews([])
    setShops([])
    let shopRefs = []

    let reviewsQuery
    if (drinkCategory && priceMax) {
      reviewsQuery = reviewsRef
        .where('drink_category', '==', drinkCategory)
        .where('price', '<=', priceMax)
        .where('price', '>=', priceMin)
    } else if (drinkCategory) {
      reviewsQuery = reviewsRef
        .where('drink_category', '==', drinkCategory)
        .where('price', '>=', priceMin)
    } else if (priceMax) {
      reviewsQuery = reviewsRef
        .where('price', '<=', priceMax)
        .where('price', '>=', priceMin)
    } else {
      reviewsQuery = reviewsRef.where('price', '>=', priceMin)
    }

    reviewsQuery
      .get()
      .then(snapshot => {
        snapshot.forEach(newReview => {
          if (
            newReview.data().shop &&
            newReview.data().drink_name &&
            newReview.data().drink_name.toLowerCase().includes(drink)
          ) {
            setReviews(reviews => [
              ...reviews,
              { ref: newReview.ref, ...newReview.data() },
            ])
            let duplicated = false
            shopRefs.forEach(ref => {
              if (ref.isEqual(newReview.data().shop)) {
                duplicated = true
              }
            })
            if (!duplicated) {
              shopRefs.push(newReview.data().shop)
            }
          }
        })

        shopRefs.forEach(shopRef => {
          shopRef
            .get()
            .then(newShop => {
              if (
                newShop.data().name &&
                newShop.data().name.toLowerCase().includes(place) &&
                (!placeCategory || newShop.data().category === placeCategory)
              ) {
                setShops(shops => [
                  ...shops,
                  { ref: newShop.ref, ...newShop.data() },
                ])
              }
            })
            .catch(error => {
              console.log('Error getting shops documents: ', error)
            })
        })
      })
      .catch(error => {
        console.log('Error getting reviews documents: ', error)
      })
  }

  useEffect(() => {
    reviewsRef
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          setReviews(reviews => [...reviews, { ref: doc.ref, ...doc.data() }])
        })
      })
      .catch(error => {
        console.log('Error getting reviews documents: ', error)
      })

    shopsRef
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (!doc.data().geocode) return
          setShops(shops => [...shops, { ref: doc.ref, ...doc.data() }])
        })
      })
      .catch(error => {
        console.log('Error getting shops documents: ', error)
      })
  }, [])

  if (currentUser) {
    return (
      <>
        <form onSubmit={handleSearch}>
          <label>
            Drink
            <input
              type="text"
              placeholder="Search drink"
              value={drink}
              onChange={handleDrinkChange}
            />
          </label>
          <label>
            Drink category
            <select value={drinkCategory} onChange={handleDrinkCategoryChange}>
              <option value="">Select drink category</option>
              {drinkCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Place
            <input
              type="text"
              placeholder="Search place"
              value={place}
              onChange={handlePlaceChange}
            />
          </label>
          <label>
            Place category
            <select value={placeCategory} onChange={handlePlaceCategoryChange}>
              <option value="">Select place category</option>
              {placeCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price max
            <input
              type="number"
              placeholder="max"
              value={priceMax}
              onChange={handlePriceMaxChange}
            />
          </label>
          <label>
            Price min
            <input
              type="number"
              value={priceMin}
              onChange={handlePriceMinChange}
            />
          </label>
          <button type="submit">search</button>
        </form>

        <Map shops={shops} reviews={reviews} />

        <Link to="/CreateReview" className="blue-color">
          Create Review
        </Link>
      </>
    )
  } else {
    return <Login />
  }
}
