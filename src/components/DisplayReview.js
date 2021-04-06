import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../firebase/index'
import Loading from './Loading'
import defDrink from '../assets/icons/def-drink.svg'

const DisplayReview = () => {
  const { currentUser } = useAuth()

  const [reviews, setReviews] = useState([])
  const [shopInfo, setShopInfo] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShallowLoading, setIsShallowLoading] = useState(true)

  const pathName = window.location.pathname
  const fbPathName = pathName.replace('/shop', 'shops')
  const shopRef = db.doc(fbPathName)
  const usersRef = db.collection('users')
  const reviewsRef = db.collection('reviews')

  useEffect(() => {
    shopRef
      .get()
      .then(shopDoc => {
        if (shopDoc.exists) {
          const shop = shopDoc.data()
          setShopInfo(shop)
          setIsLoading(false)

          reviewsRef
            .where('shop', '==', shopRef)
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(reviewDoc => {
                const newReview = { ref: reviewDoc.ref, ...reviewDoc.data() }

                usersRef
                  .doc(newReview.user.id)
                  .get()
                  .then(snapshot => {
                    const user = { id: snapshot.id, ...snapshot.data() }

                    if (newReview.fullPath) {
                      storage
                        .ref(newReview.fullPath)
                        .getDownloadURL()
                        .then(url => {
                          setReviews(reviews => [
                            ...reviews,
                            { ...newReview, shop, user, img: url },
                          ])
                          setIsShallowLoading(false)
                        })
                        .catch(err => {
                          console.log('Error downloading file:', err)
                          setReviews(reviews => [
                            ...reviews,
                            { ...newReview, shop, user, img: 'doesNotExist' },
                          ])
                          setIsShallowLoading(false)
                        })
                    } else {
                      setReviews(reviews => [
                        ...reviews,
                        { ...newReview, shop, user, img: 'doesNotExist' },
                      ])
                      setIsShallowLoading(false)
                    }
                  })
                  .catch(err => {
                    console.log('Error getting document:', err)
                    setReviews(reviews => [
                      ...reviews,
                      {
                        ...newReview,
                        shop,
                        user: { id: undefined, name: 'unknow user' },
                        img: 'doesNotExist',
                      },
                    ])
                    setIsShallowLoading(false)
                  })
              })
            })
            .catch(err => {
              console.log('No review found')
              setIsShallowLoading(false)
            })
        } else {
          console.log('No such document!')
          setIsLoading(false)
        }
      })
      .catch(err => {
        console.log('Error getting document:', err)
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
              const shopDocRef = db.collection('shops').doc(doc.data().shop.id)
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

  const reviewItems = reviews.map(review => {
    return (
      <div className="reviews-background reviews-area" key={review.ref.id}>
        {review.img !== 'doesNotExist' && review.img !== 'doesExist' ? (
          <img src={review.img} className="review-img" alt="drink" />
        ) : (
          <div className="review-img">
            <img src={defDrink} alt="drink icon" />
          </div>
        )}

        <div className="layout-grid">
          <h2 className="u-text-small">{review.drink_name}</h2>
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
          <p className="user-name">{review.user.name}</p>
          <div className="delete-edit-wrapper">
            {currentUser.uid === review.user.id ? (
              <>
                <button className="btn--secondary btn--xs btn--link">
                  <Link to={'/review/edit/' + review.ref.id}>Edit</Link>
                </button>
                <button onClick={() => handleDelete(review)} className="btn--tertiary btn--xs">
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  })

  if (isLoading) return <Loading />

  return (
    <div className="page-location">
      <div className="shop-basic-info">
        <h2>{shopInfo.name}</h2>
        <p>{shopInfo.category}</p>
        <p>{shopInfo.address}</p>
      </div>
      {isShallowLoading ? <Loading /> : <div className="review-wrapper">{reviewItems}</div>}
    </div>
  )
}

export default DisplayReview
