import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";








const DisplayReview = () => {

    return (
        <div className='displayreview' >
            <p>test</p>
        </div>
    )


}

export default DisplayReview;



/*getData() async{
    String userId = (await FirebaseAuth.instance.currentUser()).uid;
    return Firestore.instance.collection('users').document(userId);
  }*/