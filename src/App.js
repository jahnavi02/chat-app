import './App.css';
import React, {useState, useRef} from 'react';
import firebase from 'firebase/compat/app';


import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/analytics';

//importing inbuilt firebase hook that will be used for authentication
import {useAuthState} from 'react-firebase-hooks/auth';

import {useCollectionData} from 'react-firebase-hooks/firestore';


firebase.initializeApp({

  //configuration to commect remote app

  apiKey: "AIzaSyBwrQdLTU8sZIBmyDjAghDHIW8wmSgDNqI",
  authDomain: "j-react-chat-app.firebaseapp.com",
  projectId: "j-react-chat-app",
  databaseURL: "https://j-react-chat-app.firebaseio.com",
  storageBucket: "j-react-chat-app.appspot.com",
  messagingSenderId: "167145446344",
  appId: "1:167145446344:web:6d5564c2cc59da3f8cbefd",
  measurementId: "G-YH82XLSB0G"
})


const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  // How the component works, what this component will do

  
  const [user] = useAuthState(auth); //firebase will automatically tell if the user is authenticated or not
//signed in or not



  // How the component will be displayed
  return (
    <div className="App">
      <header>
        <h1>Come, Let's Talk!</h1>

        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );

  function SignIn() {

    const signInWithGoogle = () =>{
      const provider = new firebase.auth.GoogleAuthProvider();

      auth.signInWithPopup(provider);
    }

    return(
      <>

      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>

      <p>Lets connect and talk</p>
      </>
    )
  }


  function SignOut() {
    return auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
    )
  }


  function ChatRoom() {

    const dummy = useRef();

    const messagesRef = firestore.collection('messages');

    const query = messagesRef.orderBy('createdAt').limit(150);

    const [messages] = useCollectionData(query, {idField: 'id'});

    const [formValue, setFormValue] = useState(''); 

    const sendMessage = async (e) => {
      e.preventDefault();

      const {uid, photoURL} = auth.currentUser;

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })

      setFormValue('');
    
      dummy.current.scrollIntoView({behavior: 'smooth'});
    }

    return(
      <>

      {messages && messages.map(msg => <ChatMessage key = {msg.id} message = {msg} />)}

      <span ref={dummy}></span>
      <form onSubmit={sendMessage}>

        <input value={formValue} onChange = {(e)=>setFormValue(e.target.value)} placeholder = "Say Something Nice" />

        <button type='submit' disabled={!formValue}>Send</button>



      </form>
      </>
    )
  }

  function ChatMessage(props){
    const {text,uid,photoURL} = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return(
      <>
      <div className={`message ${messageClass}`}>

        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}/>
        <p>{text}</p>

      </div>
      </>
    )
  }
}

export default App;
