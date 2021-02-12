import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { db } from '../firebase/index'

const containerStyle = {
  width: '100%',
  height: '600px',
}

const center = {
  lat: 49.282729,
  lng: -123.120738,
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
}

const libraries = ['places']

const shopsRef = db.collection('shops')
// const usersRef = db.collection('users')
const reviewsRef = db.collection('reviews')
// const categoriesRef = db.collection('drink_categories')

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const [value, setValue] = useState('')
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [selected, setSelected] = useState(null)

  const mapRef = useRef()

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const handleChange = (e) => setValue(e.target.value)

  const handleSearch = (e) => {
    e.preventDefault()
    setReviews([])
    setShops([])

    reviewsRef
      .get()
      .then((snapshot) => {
        snapshot.forEach((review) => {
          if (
            review.data().drink_name.toLowerCase().includes(value.toLowerCase())
          ) {
            setReviews((reviews) => [...reviews, review.data()])
            review
              .data()
              .shop.get()
              .then((shop) => {
                setShops((shops) => [
                  ...shops,
                  { ref: shop.ref, ...shop.data() },
                ])
              })
              .catch((error) => {
                console.log('Error getting shops documents: ', error)
              })
          }
        })
      })
      .catch((error) => {
        console.log('Error getting reviews documents: ', error)
      })
  }

  useEffect(() => {
    shopsRef
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().geocode) {
            setShops((shops) => [...shops, { ref: doc.ref, ...doc.data() }])
          }
        })
      })
      .catch((error) => {
        console.log('Error getting shops documents: ', error)
      })

    reviewsRef
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          setReviews((reviews) => [...reviews, doc.data()])
        })
      })
      .catch((error) => {
        console.log('Error getting reviews documents: ', error)
      })
  }, [])

  if (loadError) return 'Error loading map'
  if (!isLoaded) return 'Loading map'

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        options={options}
        zoom={11}
        onMapLoad={onMapLoad}
      >
        {/* Child components, such as shops, info windows, etc. */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search place or drink"
            value={value}
            onChange={handleChange}
            id="search-box"
          />
          <button id="search-button" type="submit">
            search
          </button>
        </form>

        {shops.map((marker, i) => (
          <Marker
            key={i}
            position={{
              lat: marker.geocode.latitude,
              lng: marker.geocode.longitude,
            }}
            onClick={() => setSelected(marker)}
          />
        ))}
        {selected ? (
          <InfoWindow
            position={{
              lat: selected.geocode.latitude,
              lng: selected.geocode.longitude,
            }}
            onCloseClick={() => {
              setSelected(null)
            }}
          >
            <>
              <h5>{selected.name}</h5>
              {reviews.map((review, i) => {
                if (selected.ref.isEqual(review.shop)) {
                  return (
                    <div key={i}>
                      <h6>{review.drink_name}</h6>
                      <p>{review.comment}</p>
                    </div>
                  )
                }
              })}
            </>
          </InfoWindow>
        ) : null}
      </GoogleMap>
      <div>
        <h1>Shop List</h1>
        <ul>
          {shops.map((shop) => (
            <li key={shop.name}>{shop.name}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default React.memo(Map)
