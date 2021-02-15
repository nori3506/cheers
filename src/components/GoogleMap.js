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
  height: '400px',
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
}

const center = {
  lat: 49.282729,
  lng: -123.120738,
}

const zoom = 11

const libraries = ['places']

const shopsRef = db.collection('shops')
const reviewsRef = db.collection('reviews')

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const [range, setRange] = useState({
    min: {
      lat: center.lat - 180 / Math.pow(2, zoom),
      lng: center.lng - 360 / Math.pow(2, zoom),
    },
    max: {
      lat: center.lat + 180 / Math.pow(2, zoom),
      lng: center.lng + 360 / Math.pow(2, zoom),
    },
  })
  const [value, setValue] = useState('')
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [selected, setSelected] = useState(null)

  const mapRef = useRef()

  const handleLoad = useCallback((map) => {
    mapRef.current = map
  }, [])
  const handleTextChange = (e) => setValue(e.target.value.toLowerCase())
  const handleRangeChange = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter().toJSON()
      const newZoom = mapRef.current.zoom
      setRange({
        min: {
          lat: newCenter.lat - 180 / Math.pow(2, newZoom),
          lng: newCenter.lng - 360 / Math.pow(2, newZoom),
        },
        max: {
          lat: newCenter.lat + 180 / Math.pow(2, newZoom),
          lng: newCenter.lng + 360 / Math.pow(2, newZoom),
        },
      })
    }
  }
  const handleSearch = (e) => {
    e.preventDefault()

    setReviews([])
    setShops([])

    let shopRefs = []

    reviewsRef
      .get()
      .then((snapshot) => {
        snapshot.forEach((newReview) => {
          if (
            newReview.data().drink_name &&
            newReview.data().drink_name.toLowerCase().includes(value)
          ) {
            setReviews((reviews) => [...reviews, newReview.data()])

            let duplicated = false
            shopRefs.forEach((shopRef) => {
              if (shopRef.isEqual(newReview.data().shop)) {
                duplicated = true
              }
            })

            if (!duplicated) {
              shopRefs.push(newReview.data().shop)
            }
          }
        })

        shopRefs.forEach((shopRef) => {
          shopRef
            .get()
            .then((newShop) => {
              setShops((shops) => {
                return [...shops, { ref: newShop.ref, ...newShop.data() }]
              })
            })
            .catch((error) => {
              console.log('Error getting shops documents: ', error)
            })
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
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search place or drink"
          value={value}
          onChange={handleTextChange}
        />
        <button type="submit">search</button>
      </form>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        options={options}
        zoom={zoom}
        onLoad={handleLoad}
        onCenterChanged={handleRangeChange}
        onZoomChanged={handleRangeChange}
      >
        {/* Child components, such as shops, info windows, etc. */}
        {shops.map((shop, i) => {
          const lat = shop.geocode.latitude
          const lng = shop.geocode.longitude
          if (
            lat >= range.min.lat &&
            lat <= range.max.lat &&
            lng >= range.min.lng &&
            lng <= range.max.lng
          ) {
            return (
              <Marker
                key={i}
                position={{ lat, lng }}
                onClick={() => setSelected(shop)}
              />
            )
          }
        })}
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
          {shops.map((shop) => {
            const lat = shop.geocode.latitude
            const lng = shop.geocode.longitude
            if (
              lat >= range.min.lat &&
              lat <= range.max.lat &&
              lng >= range.min.lng &&
              lng <= range.max.lng
            ) {
              return (
                <li
                  key={shop.name}
                  onClick={() => setSelected(shop)}
                  style={{ cursor: 'pointer' }}
                >
                  {shop.name}
                </li>
              )
            }
          })}
        </ul>
      </div>
    </>
  )
}

export default React.memo(Map)
