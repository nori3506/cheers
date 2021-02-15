import React, { useCallback, useState, useEffect } from 'react'
import { Form, Button, Alert, Tabs, Tab, } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, strage } from '../firebase/index'
import { SelectInput, TextInput } from './UIkit';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Profile() {
  const classes = useStyles();
  const [photoURL, setPhotoURL] = useState("");
  const { currentUser, updatePassword, updateEmail } = useAuth()
  const [error, setError] = useState('')
  const [message,setMessage] = useState('')
  const history = useHistory()
  const [reviews, setReviews] = useState([])
  
  useEffect(() => {
    const reviewsRef = db.collection('reviews')
    setReviews([])
    const getReviews = reviewsRef.get().then((snapshot) => {
      snapshot.forEach((review) => {
        if (review.data().user.id.includes(currentUser.uid)) {
          setReviews((reviews) => [...reviews, review.data()])
        }
      })
    })

    db.collection('users').doc(currentUser.uid).get().then(res => {
      setAge(res.data().age)
      setGender(res.data().gender)
      setFavDrink(res.data().favDrink)
    })
    
    strage.ref(currentUser.photoURL).getDownloadURL().then(url => {
      setPhotoURL(url)
    })
  },[])

  const [isLoading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName),
        [email, setEmail] = useState(currentUser.email),
        [password, setPassword] = useState(""),
        [passwordConfirm, setPasswordConfirm] = useState(""),
        [age, setAge] = useState(""),
        [gender, setGender] = useState(""),
        [favDrink, setFavDrink] = useState("");
        

  const inputDisplayName = useCallback((event) => {
    setDisplayName(event.target.value)
  }, [setDisplayName]);

  const inputEmail = useCallback((event) => {
    setEmail(event.target.value)
  }, [setEmail]);

  const inputFavDrink = useCallback((event) => {
    setFavDrink(event.target.value)
  }, [setFavDrink]);

  const inputPassword = useCallback((event) => {
    setPassword(event.target.value)
  }, [setPassword]);

  const inputPasswordConfirm = useCallback((event) => {
    setPasswordConfirm(event.target.value)
  }, [setPasswordConfirm]);

  const ageHandleChange = (event) => {
    setAge(event.target.value);
  };

  const genderHandleChange = (event) => {
    setGender(event.target.value);
  };


  const updateUserProfile = (e) => {
    e.preventDefault()
    
    if (password !== passwordConfirm) {
      return setError('passwords do not match')
    }

    const promises = []
    setLoading(true)
    setError("")
    setMessage("")
    
    // Email Update
    if(email !== currentUser.email) {
      promises.push(updateEmail(email))
    }

    // Password Update
    if(password) {
      promises.push(updatePassword(password))
    }

    //Display Name Update
    if (currentUser.name !== displayName) {
      promises.push(currentUser.updateProfile({
        displayName: displayName
      }))
    }

    //Age, Gender, Fav Drink Update
    promises.push(db.collection('users').doc(currentUser.uid).get().then((doc) => {
      if (doc.data().age != age) {
        db.collection('users').doc(currentUser.uid).update({age: age})
      }
      if (doc.data().gender != gender) {
        db.collection('users').doc(currentUser.uid).update({gender: gender})
      }
      if (doc.data().favDrink != favDrink) {
        db.collection('users').doc(currentUser.uid).update({favDrink: favDrink})     
      }
    }))

    
    Promise.all(promises).then(() => {
      setMessage('Profile was successfully updated')
    }).catch(() => {
      setError('Failed to update profile')
    }).finally(() => {
      setLoading(false)
    })    
  }

  // Profile Image Update(Indipendent Action from Others)
  const handlePhoto = (event) => {
    const image = event.target.files[0];
    const fullPath = "profileImage/" + currentUser.uid + image.name
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
      <Tabs defaultActiveKey="profile" >
        <Tab eventKey="profile" title="Profile">
          <Form onSubmit={updateUserProfile}>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>} 
            <img src={photoURL} className="w-100" />
            <input
              type={"file"}
              onChange={ handlePhoto }
            />
            <TextInput
              fullWidth={true} label={"User Name"} multiline={false} required={true}
              rows={1} value={ displayName } type={"text"} onChange={inputDisplayName} 
            />
            
            <TextInput required
              fullWidth={true} label={"Email"} multiline={false} required={true}
              rows={1} value={ email } type={"email"} onChange={inputEmail} 
            /> 

            <TextInput
              fullWidth={true} label={"Password"} multiline={false} autoComplete="new-password"
              rows={1} type={"password"} onChange={inputPassword} 
            /> 

            <TextInput
              fullWidth={true} label={"Password Confirm"} multiline={false}
              rows={1} type={"password"} onChange={inputPasswordConfirm} 
            /> 

            <TextInput
              fullWidth={true} label={"Favorite Drink"} multiline={false}
              rows={1} value={ favDrink } type={"text"} onChange={inputFavDrink} 
            /> 

            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-required-label">Gender</InputLabel>
              <SelectInput
                labelId="demo-simple-select-required-label"
                value={gender}
                onChange={genderHandleChange}
                className={classes.selectEmpty}
              >
                <MenuItem value={"male"}>Male</MenuItem>
                <MenuItem value={"female"}>Female</MenuItem>
              </SelectInput>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-required-label">Age</InputLabel>
              <SelectInput
                labelId="demo-simple-select-required-label"
                value={age}
                onChange={ageHandleChange}
                className={classes.selectEmpty}
              >
                <MenuItem value={10}>10's</MenuItem>
                <MenuItem value={20}>20's</MenuItem>
                <MenuItem value={30}>30's</MenuItem>
                <MenuItem value={40}>40's</MenuItem>
                <MenuItem value={50}>50's</MenuItem>
                <MenuItem value={60}>60's</MenuItem>
                <MenuItem value={70}>70's</MenuItem>
                <MenuItem value={80}>80's</MenuItem>
                <MenuItem value={90}>90's</MenuItem>
              </SelectInput>
            </FormControl>
            <br />
            <Button
              className="w-100"
              type="submit"
              variant="primary"
            >
              {isLoading ? 'Loading…' : 'Update'}
            </Button>
          </Form>
        </Tab>
        <Tab eventKey="reviews" title="Reviews">
          {reviews && reviews.map((review) => {
            return (
              <>
                <li>{review.comment}</li>
              </>
            )
          })}
        </Tab>
      </Tabs>
    </>
  )
}
