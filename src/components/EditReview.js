import React, { useState, useEffect } from 'react'
import { db, strage } from '../firebase/index'
import { useAuth } from '../contexts/AuthContext'
import { Form, Button, Alert, Tabs, Tab, } from 'react-bootstrap'
import { SelectInput, TextInput } from './UIkit';

export default function EditReview() {
  const [review, setReview] = useState("")
  const [drinkName, setdrinkName] = useState("")
  let review_id = window.location.pathname.split('/review/edit/', 2)[1]

  useEffect(() => {
    const reviewRef = db.collection('reviews').doc(review_id)
    reviewRef.get().then(doc => {
      setReview(doc.data())
      setdrinkName(doc.data().drink_name)
    })
  }, [])

  const updateReview = () => {
    console.log("hogehoge")
  }

  const aaa = () => {
    console.log("hoge")
  }

  return (
    <> 
      <Form onSubmit={updateReview}>
        <TextInput
          fullWidth={true} label={"Drink name"} multiline={false} required={true}
          rows={1} value={drinkName} type={"text"} onChange={aaa} 
        />
        
        <br />
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
