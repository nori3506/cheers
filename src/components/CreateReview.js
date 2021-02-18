// import React from 'react';
// import { withRouter } from 'react-router-dom';
// import Map from './GoogleMap'
// import firebase from "firebase/app";
// import "firebase/firestore";
// import { db } from '../firebase/index'


// class CreateReview extends React.Component {
//     constructor(props) {
//       super(props);
//       // this.state = {comment: ''};
//       this.state = {drink_name: ''};
//       this.state = {drink_category: ''};
//       this.state = {price: ''};
//       this.state = {rating: ''};
//       this.state = {comment: ''};
//       this.state = {image: ''};
//       this.state = {user: ''};
//       this.state = {
//         isSubmitted: false,
//       };

//       let user = firebase.auth().currentUser;
//       console.log(user.email)

//       // this.handleChange = this.handleChange.bind(this);
//       this.handleSubmit = this.handleSubmit.bind(this);
//       this.drink_name = this.drink_name.bind(this);
//       this.drink_category= this.drink_category.bind(this);
//       this.price = this.price.bind(this);
//       this.rating = this.rating.bind(this);
//       this.comment = this.comment.bind(this);
//       this.image = this.image.bind(this);
//       this.user = this.user.bind(this);
//     }

//     // handleChange(event) {
//     //   this.setState({comment: event.target.value});
//     // }
//     drink_name(event) {
//       this.setState({drink_name: event.target.value});
//     }
//     drink_category(event) {
//       this.setState({drink_category: event.target.value});
//     }
//     price(event) {
//       this.setState({price: event.target.value});
//     }
//     rating(event) {
//       this.setState({rating: event.target.value});
//     }
//     comment(event){
//       this.setState({comment: event.target.value})
//     }
//     image(event){
//       this.setState({image: event.target.value})
//     }
//     user(){
//       this.setState({user: user})
//     }



//     handleSubmit(event) {
//         // alert('A name was submitted: ' + this.state.comment);
//         this.setState({isSubmitted:true})
//         this.props.history.push('/')
//         db.collection("reviews").add({
//         // comment:this.state.comment,
//         drink_name:this.state.drink_name,
//         drink_category:this.state.drink_category,
//         price:this.state.price,
//         rating:this.state.rating,
//         comment:this.state.comment,
//         image:this.state.comment,
//         userid:this.user.uid
//         })
//         // event.preventDefault();
//       }

//       render() {
//         let createreview
//         if (this.state.isSubmitted) {
//           createreview = (
//             <div className='create-review-message'>
//               Submitted
//             </div>
//           );
//         } else {
//           createreview = (
//             <form  onSubmit={()=>{this.handleSubmit()}} >
//               {/* <p>Title*</p>
//               <input 　required　name="title" value={this.state.value} onChange={this.handleChange}/> */}
//               {/* delete ↑ */}
//               <p>Drink name*</p>
//               <input required name="drink_name" onChange={this.drink_name}/>
//               <p>images</p>
//               <input　type='file' accept=".png, .jpg, .jpeg" name="images" onChange={this.image}/>
//               <p>Shop*</p>
//               <Map />
//               <p>Category*</p>
//               <select name="category" required   onChange={this.drink_category}>
//               <option value="">--- What kind of drink? ---</option>
//               <option value="drink_categories/1">Beer</option>
//               <option value="drink_categories/2">Wine</option>
//               <option value="drink_categories/3">Whiskey</option>
//               <option value="drink_categories/4">Sake</option>
//               <option value="drink_categories/5">Gin</option>
//               <option value="drink_categories/6">Rum</option>
//               <option value="drink_categories/7">Tequila</option>
//               <option value="drink_categories/8">Vodka</option>
//               <option value="drink_categories/9">Brandy</option>
//               <option value="drink_categories/10">Vermouth</option>
//               <option value="drink_categories/11">Everclear</option>
//               <option value="drink_categories/12">Absinthe</option>
//               <option value="drink_categories/13">Mead</option>
//               <option value="drink_categories/14">A liqueur</option>
//               <option value="drink_categories/15">Ethanol</option>
//               <option value="drink_categories/16">Hard Ciders</option>
//               <option value="drink_categories/17">Non-alcohol</option>
//               <option value="drink_categories/18">Others</option>
//               </select>
//               <p>Price</p>
//               <input onChange={this.price} />
//               <p>Rating</p>
//               <input　type='number'　max="5" min='1' name="rating" onChange={this.rating}/>
//               <p>Comment</p>
//               <textarea   name="comment" rows="4" cols="40" onChange={this.comment}/>
//               <input
//                 type='submit'
//                 value='Submit'
//                 style={{ display: "block" }}/>
//             </form>
//           );
//         }

//         return (
//           <div className='create-review' >
//             {createreview}
//           </div>
//         );
//       }
//     }

//     export default CreateReview

import React from 'react';
import { withRouter } from 'react-router-dom';
import Map from './GoogleMap'
import firebase from "firebase/app";
import "firebase/firestore";
import { db } from '../firebase/index'
class CreateReview extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {comment: ''};
    this.state = { drink_name: '' };
    this.state = { drink_category: '' };
    this.state = { price: '' };
    this.state = { rating: '' };
    this.state = { comment: '' };
    this.state = { image: '' };
    // this.state = { userid: '' };
    this.state = {
      isSubmitted: false,
    };
    // let user = firebase.auth().currentUser.uid;
    // console.log('current', user)
    // this.setState({ userid: user })
    // console.log('this.state.user', this.state.user)
    // console.log('user', this.state.userid)
    // this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.drink_name = this.drink_name.bind(this);
    this.drink_category = this.drink_category.bind(this);
    this.price = this.price.bind(this);
    this.rating = this.rating.bind(this);
    this.comment = this.comment.bind(this);
    this.image = this.image.bind(this);
  }
  // handleChange(event) {
  //   this.setState({comment: event.target.value});
  // }
  drink_name(event) {
    this.setState({ drink_name: event.target.value });
  }
  drink_category(event) {
    this.setState({ drink_category: event.target.value });
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
  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.comment);
    this.setState({ isSubmitted: true })
    this.props.history.push('/')
    let user = firebase.auth().currentUser.uid;
    db.collection("reviews").add({
      // comment:this.state.comment,
      drink_name: this.state.drink_name,
      drink_category: this.state.drink_category,
      price: this.state.price,
      rating: this.state.rating,
      comment: this.state.comment,
      image: this.state.comment,
      user: user
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
        <form onSubmit={() => { this.handleSubmit() }} >
          {/* <p>Title*</p>
              <input 　required　name="title" value={this.state.value} onChange={this.handleChange}/> */}
          {/* delete ↑ */}
          <p>Drink name*</p>
          <input required name="drink_name" onChange={this.drink_name} />
          <p>images</p>
          <input type='file' accept=".png, .jpg, .jpeg" name="images" onChange={this.image} />
          <p>Shop*</p>
          <Map />
          <p>Category*</p>
          <select name="category" required onChange={this.drink_category}>
            <option value="">--- What kind of drink? ---</option>
            <option value="drink_categories/1">Beer</option>
            <option value="drink_categories/2">Wine</option>
            <option value="drink_categories/3">Whiskey</option>
            <option value="drink_categories/4">Sake</option>
            <option value="drink_categories/5">Gin</option>
            <option value="drink_categories/6">Rum</option>
            <option value="drink_categories/7">Tequila</option>
            <option value="drink_categories/8">Vodka</option>
            <option value="drink_categories/9">Brandy</option>
            <option value="drink_categories/10">Vermouth</option>
            <option value="drink_categories/11">Everclear</option>
            <option value="drink_categories/12">Absinthe</option>
            <option value="drink_categories/13">Mead</option>
            <option value="drink_categories/14">A liqueur</option>
            <option value="drink_categories/15">Ethanol</option>
            <option value="drink_categories/16">Hard Ciders</option>
            <option value="drink_categories/17">Non-alcohol</option>
            <option value="drink_categories/18">Others</option>
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









