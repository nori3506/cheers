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
  lat: 49.258,
  lng: -123.194,
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
}

const libraries = ['places']

const reviewsRef = db.collection('reviews')
const shopsRef = db.collection('shops')
const category1Ref = db.collection('drink_categories').doc('1')

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const [shops, setShops] = useState([])

  const mapRef = useRef()

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const handleSearch = () => {
    reviewsRef
      .where('drink_category', '==', category1Ref)
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
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().lat && doc.data().lng) {
            setShops([...shops, { lat: doc.data().lat, lng: doc.data().lng }])
          }
        })
      })
      .catch((error) => {
        console.log('Error getting shops documents: ', error)
      })
  }, [])

  if (loadError) return 'Error loading map'
  if (!isLoaded) return 'Loading map'

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      options={options}
      zoom={10}
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
        {shops.map((shop, i) => (
          <Marker
            key={i}
            position={{ lat: shop.lat, lng: shop.lng }}
            onClick={() => console.log('Marker clicked.')}
          />
        ))}
      </>
    </GoogleMap>
  )
}

export default React.memo(Map)
