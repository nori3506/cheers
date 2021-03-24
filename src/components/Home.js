import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Map from './GoogleMap'
import Header from './Header'
import Footer from './Footer'
import Loading from './Loading'
import Login from './Login'
import { db } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import searchIcon from '../assets/icons/thick-borders.svg'

const shopsRef = db.collection('shops')
const reviewsRef = db.collection('reviews')

export default function Home() {
  const { currentUser } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [drink, setDrink] = useState('')
  const [place, setPlace] = useState('')
  const [priceMax, setPriceMax] = useState(undefined)
  const [priceMin, setPriceMin] = useState(0)
  const [drinkCategory, setDrinkCategory] = useState('')
  const [placeCategory, setPlaceCategory] = useState('')
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(true)

  const handleModalOpen = () => setModalOpen(true)
  const handleDrinkChange = e => setDrink(e.target.value.toLowerCase())
  const handleDrinkCategoryChange = e => setDrinkCategory(e.target.value)
  const handlePlaceChange = e => setPlace(e.target.value.toLowerCase())
  const handlePlaceCategoryChange = e => setPlaceCategory(e.target.value)
  const handlePriceMaxChange = e => setPriceMax(Number(e.target.value))
  const handlePriceMinChange = e => setPriceMin(Number(e.target.value))
  const handleSearch = e => {
    e.preventDefault()
    setModalOpen(false)
    setDisabled(true)
    setLoading(true)
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
      console.log(priceMin)
    } else if (priceMax) {
      reviewsQuery = reviewsRef.where('price', '<=', priceMax).where('price', '>=', priceMin)
    } else {
      reviewsQuery = reviewsRef.where('price', '>=', priceMin)
    }

    let shopsQuery
    if (placeCategory) {
      shopsQuery = shopsRef.where('category', '==', placeCategory)
      console.log(shopsQuery, placeCategory)
    } else {
      shopsQuery = shopsRef
    }

    let newReviews = []
    let newShops = []
    Promise.all([reviewsQuery.get(), shopsQuery.get()])
      .then(snapshots => {
        snapshots[0].forEach(newReview => {
          if (
            // newReview.data().shop && // this line to be removed once data structure set up
            // newReview.data().drink_name && // this line to be removed once data structure set up
            newReview.data().drink_name.toLowerCase().includes(drink)
          ) {
            newReviews.push({ ref: newReview.ref, ...newReview.data() })
          }
        })

        snapshots[1].forEach(newShop => {
          if (
            // newShop.data().name && // this line to be removed once data structure set up
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
          .map(shop => {
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
        setLoading(false)
      })
      .catch(error => {
        console.log('Failed to search: ', error)
        setDisabled(false)
        setLoading(false)
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
      setLoading(false)
    })
  }, [])

  if (currentUser && !loading) {
    return (
      <>
        <Header />
        <div className="container wrapper">
          <div className="home">
            <div className="search-link">
              <div className="search-icon">
                <img src={searchIcon} alt="search" />
              </div>
              <input
                type="text"
                placeholder="search"
                onClick={handleModalOpen}
                className="search-box"
              />
            </div>

            {modalOpen ? (
              <div className="overlay">
                <form onSubmit={handleSearch} className="form">
                  <input
                    type="text"
                    placeholder="Drink Name"
                    value={drink}
                    onChange={handleDrinkChange}
                  />

                  <select value={drinkCategory} onChange={handleDrinkCategoryChange}>
                    <option value="">Select Drink Category</option>
                    {drinkCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Place Name"
                    value={place}
                    onChange={handlePlaceChange}
                  />

                  <select value={placeCategory} onChange={handlePlaceCategoryChange}>
                    <option value="">Select Place Category</option>
                    {placeCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Price max"
                    value={priceMax}
                    onChange={handlePriceMaxChange}
                  />

                  <input
                    type="number"
                    placeholder="Price min"
                    value={priceMin}
                    onChange={handlePriceMinChange}
                  />

                  <div className="btn-area--half">
                    <button className="btn--primary btn--half" type="submit" disabled={disabled}>
                      search
                    </button>

                    <button className="btn--tertiary btn--half" onClick={() => setModalOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            <Map shops={shops} />
          </div>
        </div>
        <Footer />
      </>
    )
  } else if (currentUser) {
    return <Loading />
  } else {
    return (
      <div className="wrapper--narrow">
        <Login />
      </div>
    )
  }
}
