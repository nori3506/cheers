import React, { useState, useEffect,useCallback } from 'react'
import { db, strage } from '../firebase/index'
import { useAuth } from '../contexts/AuthContext'
import { Form, Button, Alert, Tabs, Tab, } from 'react-bootstrap'
import { SelectInput, TextInput } from './UIkit';
import drinkCategories from '../lib/drinkCategories'

export default function EditReview() {
  const [review, setReview] = useState("")
  const [drinkName, setDrinkName] = useState("")
  const [drinkCategory, setDrinkCategory] = useState("")
  const [price, setPrice] = useState("")
  const [rating, setRating] = useState()
  const [comment, setComment] = useState("")
  const [photoURL, setPhotoURL] = useState("");
  const { currentUser, updatePassword, updateEmail } = useAuth()
  let review_id = window.location.pathname.split('/review/edit/', 2)[1]
  const [error, setError] = useState('')
  const [message,setMessage] = useState('')
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const reviewRef = db.collection('reviews').doc(review_id)
    reviewRef.get().then(doc => {
      setReview(doc.data())
      setDrinkName(doc.data().drink_name)
      setDrinkCategory(doc.data().drinkcategory)
      setPrice(doc.data().price)
      setRating(doc.data().rating)
      setComment(doc.data().comment)
    })

    strage.ref(currentUser.photoURL)?.getDownloadURL().then(url => {
      setPhotoURL(url)
    })
  }, [])


  // const aaa = () => {
  //   console.log("hoge")
  // }
  // const updateReview = () => {
  //   console.log("hogehoge")
  // }



  const inputDrinkName = useCallback((event) => {
    setDrinkName(event.target.value)
  }, [setDrinkName]);

  const inputDrinkCategory = useCallback((event) => {
    setDrinkCategory(event.target.value)
  }, [setDrinkCategory]);

  const inputPrice = useCallback((event) => {
    setPrice(event.target.value)
  }, [setPrice]);

  const inputRating = useCallback((event) => {
    setRating(event.target.value)
  }, [setRating]);

  const inputComment = useCallback((event) => {
    setComment(event.target.value)
  }, [setComment]);





  const updateReview = (e) => {
    e.preventDefault()


    const promises = []
    setLoading(true)
    setError("")
    setMessage("")

  //drink name,category price etc,,,
    promises.push(db.collection('reviews').doc(review_id).get().then((doc) => {

      if (doc.data().drink_name != drinkName) {
        db.collection('reviews').doc(review_id).update({drink_name: drinkName})
      }
      if (doc.data().drinkcategory != drinkCategory) {
        db.collection('reviews').doc(review_id).update({drinkcategory: drinkCategory})
      }
      if (doc.data().price != price) {
        db.collection('reviews').doc(review_id).update({price: price})
      }
      if (doc.data().rating != rating) {
        db.collection('reviews').doc(review_id).update({rating: rating})
      }
      if (doc.data().comment != comment) {
        db.collection('reviews').doc(review_id).update({comment: comment})
      }
    }))

    Promise.all(promises).then(() => {
      setMessage('Review was successfully updated')
    }).catch(() => {
      setError('Failed to update review')
    }).finally(() => {
      setLoading(false)
    })


  }

  const handlePhoto = (event) => {
    const image = event.target.files[0];
    const fullPath = "reviewPhoto/" + currentUser.uid + image.name
    let storageRef = strage.ref().child(fullPath);
    storageRef.put(image)
      .then(res => {
        currentUser.updateProfile({
          photoURL: fullPath
        })
        .then(() => {
          strage.ref(currentUser.photoURL).getDownloadURL().then(url => {
            setPhotoURL(url)
            setMessage('Profile Image was successfully updated')
          })
        })
        .catch(error => {
            console.log(error);
        });
      })
      .catch(error => {
        console.log(error);
      })
  }


  return (
    <>
      <Form onSubmit={updateReview}>
        <TextInput
          fullWidth={true} label={"Drink name"} multiline={false} required={true}
          rows={1} value={drinkName} type={"text"} onChange={inputDrinkName}
        />

        <br />

        <SelectInput value={drinkCategory} onChange={inputDrinkCategory}>
          <option value="">Select drink category</option>
          {drinkCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectInput>
        <br />

        <TextInput
          fullWidth={true} label={"Price"} multiline={false} required={true}
          rows={1} value={price} type={"text"} onChange={inputPrice}
        />
         <p>Rating</p>
        <input type='number' max="5" value={rating} min='1' name="rating" onChange={inputRating} />

        <TextInput
          fullWidth={true} label={"Comment"} multiline={true} required={true}
          rows={1} value={comment} type={"text"} onChange={inputComment}
        />
        <img src={photoURL} className="w-100" />
        <input
              type={"file"}
              onChange={ handlePhoto }
          />

        <Button
          className="w-100"
          type="submit"
          variant="primary"
        >Update
        </Button>
      </Form>
    </>
  )
}

