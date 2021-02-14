import React, { useCallback, useState, useEffect } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { TextInput } from './UIkit'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, strage } from '../firebase/index'
import CardMedia from '@material-ui/core/CardMedia';



export default function Profile() {
  const [photoURL, setPhotoURL] = useState("");
  const { currentUser } = useAuth()
  console.log(currentUser)

  useEffect(() => {
    console.log("ged")
    strage.ref(currentUser.photoURL).getDownloadURL().then(url => {
      setPhotoURL(url)
    })
  },[])

  
  // const [isLoading, setLoading] = useState(false);
  // const [displayName, setDisplayName] = useState(currentUser.displayName),
  //       [email, setEmail] = useState(currentUser.email),
  //       [password, setPassword] = useState(""),
  //       [age, setAge] = useState("");

  // const inputDisplayName = useCallback((event) => {
  //   setDisplayName(event.target.value)
  // }, [setDisplayName]);

  // const updateProfile = (e) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   console.log("aaa" + isLoading)
  //   console.log("bbb" + isLoading)
  // }

  const handlePhoto = (event) => {
    const image = event.target.files[0];
    const fullPath = "profileImage/" + currentUser.uid + image.name
    let storageRef = strage.ref().child(fullPath);
    storageRef.put(image)
      .then(res => {
        console.log("done");
        currentUser.updateProfile({
          photoURL: fullPath
        })
        .then(() => {
          strage.ref(currentUser.photoURL).getDownloadURL().then(url => {
            setPhotoURL(url)
          })
          console.log("save userdata success!!");

        })
        .catch(error => {
            console.log(error);
        });
      })
      .catch(error => {
        console.log(error);
      })
    // const formData = new FormData();
    // formData.append('image', image, image.name);
    // axios.post('user/image', formData)
    //   .then(res => {
    //     console.log("done");
    //   })
    //   .catch(err => console.log(err));
  } 


  return (
    <>
      <img src={photoURL} className="w-100" />
      <input
        type={"file"}
        onChange={ handlePhoto }
      />
      {/* <TextInput
        fullWidth={true} label={"User Name"} multiline={false} required={true}
        rows={1} value={ displayName } type={"text"} onChange={inputDisplayName} 
      /> 
      <Button
        variant="primary"
        onClick={!isLoading ? updateProfile : null}
      >
        {isLoading ? 'Loading…' : 'Update'}
      </Button> */}
    </>
  )
}
