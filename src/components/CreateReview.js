import React from 'react';
import { withRouter } from 'react-router-dom';
import Map from './GoogleMap'
import firebase from "firebase/app";
import "firebase/firestore";
import { db, storage } from '../firebase/index'
import Automap from "./Automap"
import drinkCategories from '../lib/drinkCategories'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import Imageupload from './imageUpload'

class CreateReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drink_name: '' };
    this.state = { price: '' };
    this.state = { rating: '' };
    this.state = { comment: '' };
    this.state = { image: '' };
    this.state = {drinkCategory: ''};
    this.state = {
      isSubmitted: false,
    };
    this.state = { address: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.drink_name = this.drink_name.bind(this);
    this.price = this.price.bind(this);
    this.rating = this.rating.bind(this);
    this.comment = this.comment.bind(this);
    this.image = this.image.bind(this);
    this.drinkCategory = this.drinkCategory.bind(this);
  }


  drink_name(event) {
    this.setState({ drink_name: event.target.value });
  }
  price(event) {
    this.setState({ price: event.target.value });
  }
  rating(event) {
    this.setState({ rating: event.target.value });
  }
  comment(event) {
    this.setState({ comment: event.target.value })
  }
  image(event) {
    this.setState({ image: event.target.value })
  }
  drinkCategory(event){
    this.setState({drinkCategory: event.target.value})
  }


  handleSubmit(event) {
    this.setState({ isSubmitted: true })
    this.props.history.push('/')
    let currentUserUid = firebase.auth().currentUser.uid;
    let userRef = db.collection('users').doc(currentUserUid)
    db.collection("reviews").add({
      drink_name: this.state.drink_name,
      price: this.state.price,
      rating: this.state.rating,
      comment: this.state.comment,
      image: this.state.comment,
      drinkcategory: this.state.drinkCategory,
      user: userRef
    }).catch(e =>{
      console.log(e)
    })
  }

  handleChange = address => {
    this.setState({ address });
  };


  render() {


    let createreview
    if (this.state.isSubmitted) {
      createreview = (
        <div className='create-review-message'>
          Submitted
        </div>
      );
    } else {
      createreview = (

        <form onSubmit={() => { this.handleSubmit() }} >
          <p>Drink name*</p>
          <input required name="drink_name" onChange={this.drink_name} />
          {/* <p>images</p>
          <input type='file' accept=".png, .jpg, .jpeg" name="images" onChange={this.image} /> */}
          <p>Shop*</p>
          <PlacesAutocomplete
            value={this.state.address}
            onChange={this.handleChange}
            onSelect={this.handleChange}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <input
                  {...getInputProps({
                    placeholder: 'Search Places ...',
                    className: 'location-search-input',
                  })}
                />
                <div className="autocomplete-dropdown-container">
                  {loading && <div>Loading...</div>}
                  {suggestions.map(suggestion => {
                    const className = suggestion.active
                      ? 'suggestion-item--active'
                      : 'suggestion-item';
                    // inline style for demonstration purpose
                    const style = suggestion.active
                      ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                      : { backgroundColor: '#ffffff', cursor: 'pointer' };
                    return (
                      <div
                        {...getSuggestionItemProps(suggestion, {
                          className,
                          style,
                        })}
                      >
                        <span>{suggestion.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
      </PlacesAutocomplete>
      <Imageupload　/>
          <p>Drink category*</p>
            <select  onChange={this.drinkCategory}>
              <option value="">Select drink category</option>
              {drinkCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          <p>Price</p>
          <input onChange={this.price} />
          <p>Rating</p>
          <input type='number' max="5" min='1' name="rating" onChange={this.rating} />
          <p>Comment</p>
          <textarea name="comment" rows="4" cols="40" onChange={this.comment} />
          <input
            type='submit'
            value='Submit'
            style={{ display: "block" }} />
        </form>
      );
    }
    return (
      <div className='create-review' >
        {createreview}
      </div>
    );
  }
}
export default CreateReview
