import React, { useState, useRef, useCallback } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'

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

function Map(props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const { shops, reviews } = props

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
  const [selected, setSelected] = useState(null)

  const mapRef = useRef()

  const handleLoad = useCallback(map => {
    mapRef.current = map
  }, [])

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

  if (loadError) return 'Error loading map'
  if (!isLoaded) return 'Loading map'

  return (
    <>
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

          let reviewNum = 0
          reviews.forEach(review => {
            if (review.shop && review.shop.isEqual(shop.ref)) {
              reviewNum++
            }
          })

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
                label={reviewNum.toString()}
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
                    <div key={review.ref.id}>
                      <h6>{review.drink_name}</h6>
                      <p>{review.drink_category}</p>
                      <p>${review.price}</p>
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
          {shops.map(shop => {
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
                  key={shop.ref.id}
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
