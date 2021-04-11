import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../firebase/index'
import Loading from './Loading'
import defDrink from '../assets/icons/def-drink.svg'

const reviewsRef = db.collection('reviews')
const shopsRef = db.collection('shops')

const Reviews = () => {
  const { currentUser } = useAuth()

  const [reviews, setReviews] = useState([])
  const [deleteReviewId, setDeleteReviewId] = useState('')
  const [deleteShopId, setDeleteShopId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [popupOpen, setPopupOpen] = useState(false)
  const [isOnline, setNetwork] = useState(window.navigator.onLine)

  const updateNetwork = () => setNetwork(window.navigator.onLine)

  useEffect(() => {
    window.addEventListener('offline', updateNetwork)
    window.addEventListener('online', updateNetwork)
    return () => {
      window.removeEventListener('offline', updateNetwork)
      window.removeEventListener('online', updateNetwork)
    }
  }, [])

  useEffect(() => {
    reviewsRef
      .get()
      .then(snapshot => {
        snapshot.forEach(reviewDoc => {
          const newReview = { ref: reviewDoc.ref, ...reviewDoc.data() }

          if (newReview.user.id === currentUser.uid) {
            shopsRef
              .doc(newReview.shop.id)
              .get()
              .then(shopDoc => {
                const shop = shopDoc.data()

                if (!isOnline || !newReview.fullPath) {
                  setReviews(reviews => [...reviews, { ...newReview, shop, img: defDrink }])
                  setIsLoading(false)
                } else {
                  storage
                    .ref(newReview.fullPath)
                    .getDownloadURL()
                    .then(url => {
                      setReviews(reviews => [...reviews, { ...newReview, shop, img: url }])
                      setIsLoading(false)
                    })
                    .catch(err => {
                      console.log('Error downloading file:', err)
                      setReviews(reviews => [...reviews, { ...newReview, shop, img: defDrink }])
                      setIsLoading(false)
                    })
                }
              })
              .catch(err => {
                console.log('Error getting document:', err)
                setIsLoading(false)
              })
          }
        })
      })
      .catch(err => {
        console.log('Error getting collection:', err)
        setIsLoading(false)
      })
  }, [])

  const handlePopupOpen = review => {
    setPopupOpen(true)
    setDeleteReviewId(review.ref.id)
    setDeleteShopId(review.shop.id)
  }
  const handlePopupClose = () => {
    setPopupOpen(false)
    setDeleteReviewId('')
    setDeleteShopId('')
  }
  const handleDelete = (reviewId, shopId) => {
    handlePopupClose()

    reviewsRef
      .doc(reviewId)
      .delete()
      .then(() => {
        const newReviews = reviews.filter(review => review.ref.id !== reviewId)
        setReviews(newReviews)

        const shopRef = shopsRef.doc(shopId)
        reviewsRef
          .where('shop', '==', shopRef)
          .get()
          .then(querySnapshot => {
            if (querySnapshot.empty) {
              shopRef.delete()
            }
          })
          .catch(err => console.log('Error getting documents: ', err))
      })
  }

  const Popup = () => {
    return (
      <div className="overlay--trans">
        <div className="popup">
          <p className="popup-message">Are you sure to delete this review?</p>
          <div className="btn-area--half">
            <button onClick={handlePopupClose} className="btn--secondary btn--half">
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteReviewId, deleteShopId)}
              className="btn--primary btn--half"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  const reviewItems = reviews.map((review, i) => {
    return (
      <div className="reviews-background reviews-area profile-review" key={review.ref.id}>
        <div className="review-img-container">
          <img
            src={review.img}
            className={review.img === defDrink ? 'review-icon' : 'review-img'}
            alt="drink"
          />
        </div>

        <div className="layout-grid">
          <h2 className="u-text-small">
            {review.drink_name}&#160;<span className="normal-font-weight">at</span>{' '}
            {review.shop.name}
          </h2>
          <p className="category">{review.drink_category}</p>
          <p className="price">{review.price} CAD</p>
          {(() => {
            const rating = review.rating
            const noRating = 5 - rating
            let star = ''
            let hollowStars = ''

            for (let i = 0; i < rating; i++) {
              star = star + '★'
            }
            for (let i = 0; i < noRating; i++) {
              hollowStars = hollowStars + '☆'
            }

            return (
              <p className="rating">
                {star}
                {hollowStars}
              </p>
            )
          })()}
        </div>

        <p className="comment">
          <span>"</span>
          {review.comment}
          <span>"</span>
        </p>

        <div className="bottom-row">
          <div className="delete-edit-wrapper">
            <button className="btn--secondary btn--xs btn--link">
              <Link to={'/review/edit/' + review.ref.id}>Edit</Link>
            </button>
            <button onClick={() => handlePopupOpen(review)} className="btn--tertiary btn--xs">
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  })

  if (isLoading) return <Loading />

  if (reviewItems.length) {
    return (
      <>
        {popupOpen ? <Popup /> : null}
        <div className="review-wrapper">{reviewItems}</div>
      </>
    )
  } else {
    return <div className="reviews-background no-reviews-container">Your Reviews are not found</div>
  }
}

export default Reviews
