import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom';
import Map from './GoogleMap'
import firebase from "firebase/app";
import "firebase/firestore";
import { db } from '../firebase/index'
import PlacesAutocomplete,{
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete"





export default function Automap(){
    const [address, setAddress] = React.useState("");
    const[coordinates, setCoordinates] = React.useState({lat:null, lng:null})
    const handleSelect = async value =>{
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      setAddress(value);
      setCoordinates(latLng);
    }


return(
    <PlacesAutocomplete
      value ={address}
      onChange={setAddress}
      onSelect={handleSelect}
      >
      {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
      <div>
        {/* <p>Latitude:{coordinates.lat}</p>
        <p>Longitude:{coordinates.lng}</p> */}

        <input {...getInputProps({placeholder: "Storename"})}/>
        <div>
          {loading ? <div>...loading</div> : null}
          {suggestions.map((suggestion)=>{
            const style = {
              backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
            };

            return <div {...getSuggestionItemProps(suggestion, {style})}>{suggestion.description}</div>;
          })}
        </div>
      </div>)}
    </PlacesAutocomplete>
    )
};



