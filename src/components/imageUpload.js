import React, { useCallback, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db, strage } from '../firebase/index'
import { SelectInput, TextInput } from './UIkit';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Reviews from './Reviews'



export default function Imageupload() {

  const [photoURL, setPhotoURL] = useState("");
  const { currentUser, updatePassword, updateEmail } = useAuth()
  const [message,setMessage] = useState('')

     // Profile Image Update(Indipendent Action from Others)
  const handlePhoto = (event) => {
    const image = event.target.files[0];
    const fullPath = "reviewPhoto/" + currentUser.uid + image.name
    let storageRef = strage.ref().child(fullPath);
    storageRef.put(image)
    //   .then(res => {
    //     currentUser.updateProfile({
    //       photoURL: fullPath
    //     })
    //     .then(() => {
    //       strage.ref(currentUser.photoURL).getDownloadURL().then(url => {
    //         setPhotoURL(url)
    //         setMessage('Profile Image was successfully updated')
    //       })
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });
    //   })
      .catch(error => {
        console.log(error);
      })
  }

  return (
    <>
        <p>images</p>
        <img src={photoURL} className="w-100" />
        <input type={"file"} onChange={ handlePhoto }/>

    </>
  )
}
