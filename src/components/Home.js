import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Login from '../templates/Login'
import { db } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import searchIcon from '../assets/icons/thick-borders.svg'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faSearch } from '@fortawesome/free-solid-svg-icons'

const shopsRef = db.collection('shops')
const reviewsRef = db.collection('reviews')

export default function Home({ title, setTitle }) {
  const { currentUser } = useAuth()

  const [drink, setDrink] = useState('')
  const [place, setPlace] = useState('')
  const [priceMax, setPriceMax] = useState(undefined)
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
      reviewsQuery = reviewsRef.where('price', '<=', priceMax).where('price', '>=', priceMin)
    } else {
      reviewsQuery = reviewsRef.where('price', '>=', priceMin)
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

        const reviewsMatchShop = newReviews.filter(newReview => {
          let match = false
          for (let i = 0; i < newShops.length; i++) {
            if (newReview.shop.isEqual(newShops[i].ref)) {
              match = true
              break
            }
          }
          return match
        })

        const shopsMatchReview = newShops
          .map((shop, i) => {
            let reviewNum = 0
            reviewsMatchShop.forEach(review => {
              if (review.shop && review.shop.isEqual(shop.ref)) {
                reviewNum++
              }
            })
            return { ...shop, reviewNum }
          })
          .filter(shop => shop.reviewNum !== 0)

        setReviews(reviewsMatchShop)
        setShops(shopsMatchReview)
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

      const shopsWithReviewNum = newShops
        .map((shop, i) => {
          let reviewNum = 0
          newReviews.forEach(review => {
            if (review.shop && review.shop.isEqual(shop.ref)) {
              reviewNum++
            }
          })
          return { ...shop, reviewNum }
        })
        .filter(shop => shop.reviewNum !== 0)

      setReviews(newReviews)
      setShops(shopsWithReviewNum)
      setDisabled(false)
    })
  }, [])

  if (currentUser) {
    return (
      <>
        <div className="home__search-link">
          <div className="home__search-icon">
            <img src={searchIcon} alt="search" />
          </div>
          <input type="text" placeholder="search" className="home__search-box" />
        </div>
        <form onSubmit={handleSearch} className="home__search-form">
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
            <input type="number" value={priceMin} onChange={handlePriceMinChange} />
          </label>
          <button className="search-buttton" type="submit" disabled={disabled}>
            search
          </button>
        </form>

        <Map shops={shops} reviews={reviews} />
      </>
    )
  } else {
    return <Login />
  }
}
