import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Login from '../templates/Login'
import { Link } from 'react-router-dom'
import { db } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import beerLogo from '../assets/icons/beer.svg'

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
    e.preventDefault()
    setDisabled(true)
    setReviews([])
    setShops([])

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

    let shopsQuery
    if (placeCategory) {
      shopsQuery = shopsRef.where('category', '==', placeCategory)
    } else {
      shopsQuery = shopsRef
    }

    let newReviews = []
    let newShops = []

    Promise.all([reviewsQuery.get(), shopsQuery.get()])
      .then(snapshots => {
        snapshots[0].forEach(newReview => {
          if (
            newReview.data().shop && // this line to be removed once data structure set up
            newReview.data().drink_name && // this line to be removed once data structure set up
            newReview.data().drink_name.toLowerCase().includes(drink)
          ) {
            newReviews.push({ ref: newReview.ref, ...newReview.data() })
          }
        })

        snapshots[1].forEach(newShop => {
          if (
            newShop.data().name && // this line to be removed once data structure set up
            newShop.data().name.toLowerCase().includes(place)
          ) {
            newShops.push({ ref: newShop.ref, ...newShop.data() })
          }
        })

        setReviews(
          newReviews.filter(newReview => {
            let match = false
            for (let i = 0; i < newShops.length; i++) {
              if (newReview.shop.isEqual(newShops[i].ref)) {
                match = true
                break
              }
            }
            return match
          })
        )

        setShops(
          newShops.filter(newShop => {
            let match = false
            for (let i = 0; i < newReviews.length; i++) {
              if (newReviews[i].shop.isEqual(newShop.ref)) {
                match = true
                break
              }
            }
            return match
          })
        )

        setDisabled(false)
      })
      .catch(error => {
        console.log('Failed to search: ', error)
        setDisabled(false)
      })
  }

  useEffect(() => {
    let newReviews = []
    let newShops = []

    Promise.all([reviewsRef.get(), shopsRef.get()]).then(results => {
      results[0].forEach(doc => {
        newReviews.push({ ref: doc.ref, ...doc.data() })
      })

      results[1].forEach(doc => {
        if (!doc.data().geocode) return // this line to be removed once data structure set up
        newShops.push({ ref: doc.ref, ...doc.data() })
      })

      setReviews(newReviews)
      setShops(newShops)
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
          <button className="search-buttton" type="submit" disabled={disabled}>
            search
          </button>
        </form>

        <Map shops={shops} reviews={reviews} />
        {/* Example how to use SVG file. import first at top */}
        <img src={beerLogo} alt="React Logo" style={{ width: '30px' }} />
        <Link to="/CreateReview" className="blue-color">
          Create Review
        </Link>
      </>
    )
  } else {
    return <Login />
  }
}
