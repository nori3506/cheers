import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  GoogleMap,
  useLoadScript,
  StandaloneSearchBox,
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
const usersRef = db.collection('users')
const reviewsRef = db.collection('reviews')
const categoriesRef = db.collection('drink_categories')

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const [markers, setMarkers] = useState([])
  const [reviews, setReviews] = useState([])
  const [selected, setSelected] = useState(null)

  const mapRef = useRef()

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const handleSearch = () => {
    reviewsRef
      .where('drink_category', '==', categoriesRef.doc('1'))
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(doc.id, ' => ', doc.data())
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
            setMarkers((markers) => [
              ...markers,
              { ref: doc.ref, ...doc.data() },
            ])
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
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      options={options}
      zoom={11}
      onMapLoad={onMapLoad}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <>
        <StandaloneSearchBox>
          <input
            type="text"
            placeholder="Search place or drink"
            id="search-box"
          />
        </StandaloneSearchBox>
        <button id="search-filter">filter</button>
        <button id="search-button" onClick={handleSearch}>
          search
        </button>
        {markers.map((marker, i) => (
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
      </>
    </GoogleMap>
  )
}

export default React.memo(Map)
