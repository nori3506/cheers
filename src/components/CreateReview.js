import React from 'react';
import { withRouter } from 'react-router-dom';
import Map from './GoogleMap'
import firebase from "firebase/app";
import "firebase/firestore";
import { db } from '../firebase/index'




class CreateReview extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
      this.state = {
        isSubmitted: false,
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
      this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        this.setState({isSubmitted:true})
        this.props.history.push('/')
        db.collection("reviews").add({
        comment:this.state.value,

  })
        // event.preventDefault();
      }

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
            <form  onSubmit={()=>{this.handleSubmit()}} >
              <p>Title*</p>
              <input 　required　name="title" value={this.state.value} onChange={this.handleChange}/>
              <p>Drink name*</p>
              <input required name="drink_name" />
              <p>images</p>
              <input　type='file' accept=".png, .jpg, .jpeg" name="images"/>
              <p>Shop*</p>
              <Map />
              <p>Category*</p>
              <select name="category" required >
              <option value="">--- What kind of drink? ---</option>
              <option value="Beer">Beer</option>
              <option value="Wine">Wine</option>
              <option value="Whiskey">Whiskey</option>
              <option value="Sake">Sake</option>
              <option value="Gin">Gin</option>
              <option value="Rum">Rum</option>
              <option value="Tequila">Tequila</option>
              <option value="Vodka">Vodka</option>
              <option value="Brandy">Brandy</option>
              <option value="Vermouth">Vermouth</option>
              <option value="Everclear">Everclear</option>
              <option value="Absinthe">Absinthe</option>
              <option value="Mead">Mead</option>
              <option value="A liqueur">A liqueur</option>
              <option value="Ethanol">Ethanol</option>
              <option value="Hard Ciders">Hard Ciders</option>
              <option value="Non-alcohol">Non-alcohol</option>
              <option value="Others">Others</option>
              </select>
              <p>Price</p>
              <input/>
              <p>Rating</p>
              <input　type='number'　max="5" min='1' name="rating"/>
              <p>Comment</p>
              <textarea   name="comment" rows="4" cols="40"/>
              <input
                type='submit'
                value='Submit'
                style={{ display: "block" }}/>
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