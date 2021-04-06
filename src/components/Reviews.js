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
  const [isLoading, setIsLoading] = useState(true)

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

                if (newReview.fullPath) {
                  storage
                    .ref(newReview.fullPath)
                    .getDownloadURL()
                    .then(url => {
                      setReviews(reviews => [...reviews, { ...newReview, shop, img: url }])
                      setIsLoading(false)
                    })
                    .catch(err => {
                      console.log('Error downloading file:', err)
                      setReviews(reviews => [
                        ...reviews,
                        { ...newReview, shop, img: 'doesNotExist' },
                      ])
                      setIsLoading(false)
                    })
                } else {
                  setReviews(reviews => [...reviews, { ...newReview, shop, img: 'doesNotExist' }])
                  setIsLoading(false)
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

  function handleDelete(review) {
    const promises = []
    if (window.confirm('Are you Sure to Delete This Review?')) {
      reviewsRef.get().then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.id === review.ref.id) {
            promises.push(reviewsRef.doc(doc.id).delete())
            Promise.all(promises).then(() => {
              const newReviews = reviews.filter(review => review.ref.id !== doc.id)
              setReviews(newReviews)
              const shopDocRef = shopsRef.doc(doc.data().shop.id)
              let query = reviewsRef.where('shop', '==', shopDocRef)
              query
                .get()
                .then(querySnapshot => {
                  if (querySnapshot.empty) {
                    shopDocRef.delete()
                  }
                })
                .catch(function (error) {
                  console.log('Error getting documents: ', error)
                })
            })
          }
        })
      })
    }
  }

  const reviewItems = reviews.map((review, i) => {
    return (
      <div className="reviews-background reviews-area profile-review" key={review.ref.id}>
        {review.img !== 'doesNotExist' ? (
          <img src={review.img} className="review-img" alt="drink" />
        ) : (
          <div className="review-img">
            <img src={defDrink} alt="drink default icon" />
          </div>
        )}

        <div className="layout-grid">
          <h2 className="u-text-small">
            {review.drink_name}&#160;<span className="normal-font-weight">at</span>{' '}
            {review.shop.name}
          </h2>
          <p className="category">{review.drink_category}</p>
          <p className="price">{review.price} CAD</p>
          {() => {
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
          }}
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
            <button onClick={() => handleDelete(review)} className="btn--tertiary btn--xs">
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  })

  if (isLoading) return <Loading />

  if (reviewItems.length) {
    return <div className="review-wrapper">{reviewItems}</div>
  } else {
    return <div className="reviews-background no-reviews-container">Your Reviews are not found</div>
  }
}

export default Reviews
