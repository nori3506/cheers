import React, { useState, useEffect, useCallback } from 'react'
import { db, storage } from '../firebase/index'
import { Form, Button, Alert } from 'react-bootstrap'
import { SelectInput, TextInput } from './UIkit'
import drinkCategories from '../lib/drinkCategories'
import ReactStars from 'react-rating-stars-component'

export default function EditReview() {
  const [review, setReview] = useState("")
  const [drinkName, setDrinkName] = useState("")
  const [drinkCategory, setDrinkCategory] = useState("")
  const [price, setPrice] = useState()
  const [rating, setRating] = useState()
  const [comment, setComment] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [image, setImage] = useState(null)
  let review_id = window.location.pathname.split('/review/edit/', 2)[1]
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reviewRef = db.collection('reviews').doc(review_id)
    reviewRef.get().then(doc => {
      const imageFulPath = doc.data().fullPath
      setReview(doc.data())
      setDrinkName(doc.data().drink_name)
      setDrinkCategory(doc.data().drink_category)
      setPrice(doc.data().price)
      console.log(doc.data().rating)
      setRating(doc.data().rating)
      setComment(doc.data().comment)
      storage
        .ref(imageFulPath)
        ?.getDownloadURL()
        .then(url => {
          setPhotoURL(url)
        })
    })
  }, [])


  const inputDrinkName = useCallback((event) => {
    setDrinkName(event.target.value)
  }, [setDrinkName]);

  const inputDrinkCategory = useCallback(
    event => {
      setDrinkCategory(event.target.value)
    },
    [setDrinkCategory]
  )

  const inputPrice = useCallback(
    event => {
      setPrice(event.target.value)
    },
    [setPrice]
  )

  // const inputRating = useCallback((event) => {
  //   setRating(event.target.value)
  // }, [setRating]);

  const inputRating = useCallback(
    event => {
      setRating(parseInt(event))
    },
    [setRating]
  )

  const inputComment = useCallback(
    event => {
      setComment(event.target.value)
    },
    [setComment]
  )

  const updateReview = e => {
    e.preventDefault()
    if (image !== null) {
      let randomID = Math.random().toString(32).substring(2)
      const fullPath = 'reviewPhoto/' + randomID + image.name
      let storageRef = storage.ref().child(fullPath)
      storageRef
        .put(image)
        .then(res => {
          db.collection('reviews')
            .doc(review_id)
            .update({ fullPath: fullPath })
            .catch(error => {
              console.log(error)
            })
        })
        .catch(error => {
          console.log(error)
        })
    }
    const promises = []
    setError('')
    setMessage('')

    //drink name,category price etc,,,
    promises.push(
      db
        .collection('reviews')
        .doc(review_id)
        .get()
        .then(doc => {
          if (doc.data().drink_name != drinkName) {
            db.collection('reviews').doc(review_id).update({ drink_name: drinkName })
          }
          if (doc.data().drinkcategory != drinkCategory) {
            db.collection('reviews').doc(review_id).update({ drinkcategory: drinkCategory })
          }
          if (doc.data().price != price) {
            db.collection('reviews').doc(review_id).update({ price: price })
          }
          if (doc.data().rating != rating) {
            db.collection('reviews').doc(review_id).update({ rating: rating })
          }
          if (doc.data().comment != comment) {
            db.collection('reviews').doc(review_id).update({ comment: comment })
          }
        })
    )

    Promise.all(promises)
      .then(() => {
        setMessage('Review was successfully updated')
      })
      .catch(() => {
        setError('Failed to update review')
      })
  }

  const handleImageChange = event => {
    const { files } = event.target
    setImage(event.target.files[0])
    setPhotoURL(window.URL.createObjectURL(files[0]))
  }

    function handleDelete() {
      if (window.confirm('Are you Sure to Delete This Review?')){
    db.collection('reviews').doc(review_id).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
    setDrinkName('')
    setDrinkCategory('')
    setPrice('')
    setRating('')
    setComment('')
    setPhotoURL('')

    const promises = []
    setError("")
    setMessage("")
    Promise.all(promises).then(() => {
      setMessage('Review was successfully deleted')
    }).catch(() => {
      setError('Failed to delete review')
    })
  }
  }

  return (
    <>
      <Form className="form edit-review" onSubmit={updateReview}>
        {/* <TextInput
           fullWidth={true} label={"Drink name"} multiline={false} required={true}
          rows={1} value={drinkName} type={"text"} onChange={inputDrinkName}
        /> */}
        <input
          fullWidth={true}
          label="Drink name"
          multiline={false}
          required={true}
          rows={1}
          value={drinkName}
          type="text"
          onChange={inputDrinkName}
          placeholder="Drink name"
        />

        {/* <br /> */}

        {/* <div class='drink_name MuiFormControl-root'> */}
        {/* <label >Categoty*</label> */}
        {/* <SelectInput  required={true} value={drinkCategory} onChange={inputDrinkCategory} >
            <option value="">Select drink category</option>
            {drinkCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectInput> */}
        <div className="select-container">
          <select required={true} value={drinkCategory} onChange={inputDrinkCategory}>
            <option value="">Select drink category</option>
            {drinkCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {/* </div> */}
        {/* <br /> */}

        {/* <TextInput
          fullWidth={true} label={"Price"} multiline={false} required={true}
          rows={1} value={price} type={"text"} onChange={inputPrice}
        /> */}
        <input
          fullWidth={true}
          label={'Price'}
          max="99999"
          multiline={false}
          required={true}
          rows={1}
          value={price}
          type={'number'}
          onChange={inputPrice}
          placeholder="Price"
        />
      {/* <div className='rating MuiFormControl-root'> */}
          {/* <label >Rating</label> */}
          {/* <input type='number'  placeholder ='Rating' max="5" value={rating} min='1' name="rating" onChange={inputRating} /> */}
          <ReactStars
         count={5}
         value={rating}
         onChange={inputRating}
         size={24}
         activeColor="#de9e48" />
      {/* </div> */}


        {/* <TextInput
          fullWidth={true} label={"Comment"} multiline={true} required={true}
          rows={1} value={comment} type={"text"} onChange={inputComment}
        /> */}
        {/* <input
          fullWidth={true} label={"Comment"} multiline={true} required={true}
          rows={1} value={comment} type={"text"} onChange={inputComment}
        /> */}

        <textarea
          className="comment"
          required={true}
          value={comment}
          placeholder="Please write a review"
          name="comment"
          rows="4"
          cols="40"
          onChange={inputComment}
        />

        <div className="image_wrapper">
          <input type={'file'} onChange={handleImageChange} />
          <img src={photoURL} className="w-100" />
        </div>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="button-wrapper btn-area--half">
          <Button
            className="w-100 submit btn--secondary btn--half" 
            // type="submit"
            variant="primary"
            label={"Delete"} onClick={() => handleDelete()}
          >Delete
          </Button>
          <Button className="w-100 submit btn--primary btn--half" type="submit" variant="primary">
            Update
          </Button>
        </div>
      </Form>
    </>
  )
}
