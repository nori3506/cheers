import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import ReactStars from 'react-rating-stars-component'
import { Alert } from 'react-bootstrap'
import { db, storage } from '../firebase/index'
import drinkCategories from '../lib/drinkCategories'

const reviewsRef = db.collection('reviews')

export default function EditReview() {
  const history = useHistory()

  const [review, setReview] = useState('')
  const [drinkName, setDrinkName] = useState('')
  const [drinkCategory, setDrinkCategory] = useState('')
  const [price, setPrice] = useState(0)
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [image, setImage] = useState(null)
  const [errMsg, setErrMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)

  const review_id = window.location.pathname.split('/review/edit/', 2)[1]
  const reviewRef = reviewsRef.doc(review_id)

  useEffect(() => {
    reviewRef.get().then(doc => {
      const reviewData = doc.data()
      const imageFulPath = reviewData.fullPath

      setReview(reviewData)
      setDrinkName(reviewData.drink_name)
      setDrinkCategory(reviewData.drink_category)
      setPrice(reviewData.price)
      setRating(reviewData.rating)
      setComment(reviewData.comment)

      storage
        .ref(imageFulPath)
        ?.getDownloadURL()
        .then(url => setPhotoURL(url))
    })
  }, [])

  const handleDrinkNameChange = useCallback(e => setDrinkName(e.target.value), [setDrinkName])
  const handleDrinkCategoryChange = useCallback(e => setDrinkCategory(e.target.value), [
    setDrinkCategory,
  ])
  const handlePriceChange = useCallback(e => setPrice(parseFloat(e.target.value)), [setPrice])
  const handleRatingChange = useCallback(e => setRating(parseInt(e)), [setRating])
  const handleCommentChange = useCallback(e => setComment(e.target.value), [setComment])
  const handleImageChange = e => {
    setImage(e.target.files[0])
    setPhotoURL(window.URL.createObjectURL(e.target.files[0]))
  }

  const handleUpdate = e => {
    e.preventDefault()

    setErrMsg('')
    setSuccessMsg('')

    if (image !== null) {
      const randomID = Math.random().toString(32).substring(2)
      const fullPath = 'reviewPhoto/' + randomID + image.name
      const storageRef = storage.ref().child(fullPath)

      storageRef
        .put(image)
        .then(res =>
          reviewRef
            .update({ fullPath })
            .catch(err => console.log('Failed to update path to image', err))
        )
        .catch(err => console.log('Failed to upload image', err))
    }

    reviewRef
      .update({
        drink_name: drinkName,
        drink_category: drinkCategory,
        price,
        rating,
        comment,
      })
      .then(() => setSuccessMsg('Review is successfully updated!'))
      .catch(err => {
        setErrMsg('Failed to update review')
        console.log('Failed to update review: ', err)
      })
  }

  const handlePopupOpen = e => {
    e.preventDefault()
    setPopupOpen(true)
  }
  const handlePopupClose = () => setPopupOpen(false)

  const handleDelete = () => {
    handlePopupClose()
    setDrinkName('')
    setDrinkCategory('')
    setPrice('')
    setRating('')
    setComment('')
    setPhotoURL('')
    setErrMsg('')
    setSuccessMsg('')

    reviewRef.delete().then(() => {
      reviewsRef
        .where('shop', '==', review.shop)
        .get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            review.shop.delete()
          }
          setSuccessMsg('Review is successfully deleted.')
          setReview('')
          setTimeout(() => history.push('/'), 1500)
        })
        .catch(err => {
          setErrMsg('Failed to delete review.')
          console.error('Failed to delete review: ', err)
        })
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
            <button onClick={handleDelete} className="btn--primary btn--half">
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {popupOpen ? <Popup /> : null}

      <form className="edit-review">
        <input
          label="Drink name"
          required={true}
          rows={1}
          value={drinkName}
          type="text"
          onChange={handleDrinkNameChange}
          placeholder="Drink name"
        />

        <div className="select-container">
          <select required={true} value={drinkCategory} onChange={handleDrinkCategoryChange}>
            <option value="">Select drink category</option>
            {drinkCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <input
          label="Price"
          max="99999"
          required={true}
          rows={1}
          value={price}
          type="number"
          onChange={handlePriceChange}
          placeholder="Price"
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
          value={comment}
          placeholder="Please write a review"
          name="comment"
          rows="4"
          cols="40"
          onChange={handleCommentChange}
        />

        <div className="image_wrapper">
          <input type="file" onChange={handleImageChange} />
          {photoURL ? <img src={photoURL} className="w-100" alt="drink" /> : null}
        </div>

        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errMsg && <Alert variant="danger">{errMsg}</Alert>}

        <div className="btn-area--half">
          <button className="btn--secondary btn--half" label="Delete" onClick={handlePopupOpen}>
            Delete
          </button>
          <button className="btn--primary btn--half" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </form>
    </>
  )
}
