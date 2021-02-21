import React from 'react';

const Reviews = (props) => {

  const reviewItems = props.reviews.map((review, i) => {
    return (

      <div className="reviews-background">
        <h2 className="u-text-small">{review.drink_name} <span className="normal-font-weight">at</span> {props?.shops[i]?.name}</h2>
        <li>{review.price} CAD</li>
        <li>{review.rating}</li>
        <li>{review.drink_category}</li>
        <p>"{review.comment}"</p>
      </div>
    )
  })
  if (reviewItems.length) {
    return (
      <ul>
        {reviewItems}
      </ul>
    )
  } else {
    return(
      <div className="reviews-background u-text-center">
        Your Reviews were not found
      </div>
    )
  }
}

export default Reviews;
