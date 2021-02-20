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
  const [disabled, setDisabled] = useState(true)

  const handleDrinkChange = e => setDrink(e.target.value.toLowerCase())
  const handleDrinkCategoryChange = e => setDrinkCategory(e.target.value)
  const handlePlaceChange = e => setPlace(e.target.value.toLowerCase())
  const handlePlaceCategoryChange = e => setPlaceCategory(e.target.value)
  const handlePriceMaxChange = e => setPriceMax(Number(e.target.value))
  const handlePriceMinChange = e => setPriceMin(Number(e.target.value))
  const handleSearch = e => {
    setDisabled(true)
    e.preventDefault()

    let reviewsQuery
    if (drinkCategory) {
      reviewsQuery = reviewsRef
        .where('drink_category', '==', drinkCategory)
        .where('price', '<=', priceMax)
        .where('price', '>=', priceMin)
    } else {
      reviewsQuery = reviewsRef
        .where('price', '<=', priceMax)
        .where('price', '>=', priceMin)
    }

    setReviews([])
    let shopRefs = []
    reviewsQuery
      .get()
      .then(snapshot => {
        snapshot.forEach(newReview => {
          if (
            newReview.data().shop && // this line to be removed once data structure set up
            newReview.data().drink_name && // this line to be removed once data structure set up
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

        if (shopRefs.length === 0) return setDisabled(false)

        setShops([])
        shopRefs.forEach(shopRef => {
          shopRef
            .get()
            .then(newShop => {
              if (
                newShop.data().name && // this line to be removed once data structure set up
                newShop.data().name.toLowerCase().includes(place) &&
                (!placeCategory || newShop.data().category === placeCategory)
              ) {
                setShops(shops => [
                  ...shops,
                  { ref: newShop.ref, ...newShop.data() },
                ])
              }
              setDisabled(false)
            })
            .catch(error => {
              console.log('Error getting shops documents: ', error)
              setDisabled(false)
            })
        })
      })
      .catch(error => {
        console.log('Error getting reviews documents: ', error)
        setDisabled(false)
      })
  }

  useEffect(() => {
    Promise.all([reviewsRef.get(), shopsRef.get()]).then(results => {
      results[0].forEach(doc => {
        setReviews(reviews => [...reviews, { ref: doc.ref, ...doc.data() }])
      })

      results[1].forEach(doc => {
        if (!doc.data().geocode) return // this line to be removed once data structure set up
        setShops(shops => [...shops, { ref: doc.ref, ...doc.data() }])
      })

      setDisabled(false)
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
          <button type="submit" disabled={disabled}>
            search
          </button>
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
