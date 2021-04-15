import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'
import placeCategories from '../lib/placeCategories'
import Map from './GoogleMap'
import Header from './Header'
import Footer from './Footer'
import Login from './Login'
import searchIcon from '../assets/icons/thick-borders.svg'
import closeIcon from '../assets/icons/add-review.svg'

const shopsRef = db.collection('shops')
const reviewsRef = db.collection('reviews')
const usersRef = db.collection('users')

export default function Home() {
  const { currentUser } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [drink, setDrink] = useState('')
  const [shop, setShop] = useState('')
  const [priceMax, setPriceMax] = useState(99999)
  const [priceMin, setPriceMin] = useState(0)
  const [drinkCategory, setDrinkCategory] = useState('')
  const [shopCategory, setShopCategory] = useState('')
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [disabled, setDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const handleModalOpen = () => setModalOpen(true)
  const handleClose = () => setModalOpen(false)
  const handleDrinkChange = e => setDrink(e.target.value)
  const handleDrinkCategoryChange = e => setDrinkCategory(e.target.value)
  const handleShopChange = e => setShop(e.target.value)
  const handleShopCategoryChange = e => setShopCategory(e.target.value)
  const handlePriceMaxChange = e => setPriceMax(Number(e.target.value))
  const handlePriceMinChange = e => setPriceMin(Number(e.target.value))
  const handleSearch = e => {
    e.preventDefault()
    setModalOpen(false)
    setDisabled(true)
    setIsLoading(true)
    setReviews([])
    setShops([])

    let reviewsQuery = reviewsRef
    if (drinkCategory) {
      reviewsQuery = reviewsQuery.where('drink_category', '==', drinkCategory)
    }
    if (priceMax) {
      reviewsQuery = reviewsQuery.where('price', '<=', priceMax)
    }
    reviewsQuery = reviewsQuery.where('price', '>=', priceMin)

    let shopsQuery = shopsRef
    if (shopCategory) {
      shopsQuery = shopsQuery.where('category', '==', shopCategory)
    }

    let newReviews = []
    let newShops = []
    Promise.all([reviewsQuery.get(), shopsQuery.get()])
      .then(snapshots => {
        snapshots[0].forEach(newReview => {
          console.log(newReview.data())
          if (drink && newReview.data().drink_name.toLowerCase().includes(drink.toLowerCase())) {
            newReviews.push({ ref: newReview.ref, ...newReview.data() })
          }
        })
        snapshots[1].forEach(newShop => {
          console.log(newShop.data())
          if (shop && newShop.data().name.toLowerCase().includes(shop.toLowerCase())) {
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
        setIsLoading(false)
      })
      .catch(error => {
        console.log('Failed to search: ', error)
        setDisabled(false)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    let newReviews = []
    let newShops = []

    Promise.all([reviewsRef.get(), shopsRef.get(), usersRef.get()]).then(results => {
      results[0].forEach(doc => newReviews.push({ ref: doc.ref, ...doc.data() }))
      results[1].forEach(doc => newShops.push({ ref: doc.ref, ...doc.data() }))

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
      setIsLoading(false)
    })
  }, [currentUser])

  if (currentUser) {
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
                <div className="search-wrapper">
                  <div className="close-btn-area">
                    <button onClick={handleClose} className="icon-btn--square">
                      <span className="visually-hidden">Close</span>
                      <img src={closeIcon} alt="" className="icon--close" />
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="form">
                    <input
                      type="text"
                      placeholder="Drink Name"
                      value={drink}
                      onChange={handleDrinkChange}
                    />

                    <div className="select-container">
                      <select value={drinkCategory} onChange={handleDrinkCategoryChange}>
                        <option value="">Select Drink Category</option>
                        {drinkCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Place Name"
                      value={shop}
                      onChange={handleShopChange}
                    />

                    <div className="select-container">
                      <select value={shopCategory} onChange={handleShopCategoryChange}>
                        <option value="">Select Place Category</option>
                        {placeCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

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
                      <button className="btn--secondary btn--half" onClick={handleClose}>
                        Cancel
                      </button>
                      <button className="btn--primary btn--half" type="submit" disabled={disabled}>
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            <Map shops={shops} isLoading={isLoading} />
          </div>
        </div>
        <Footer />
      </>
    )
  } else {
    return (
      <div className="wrapper--narrow">
        <Login />
      </div>
    )
  }
}
