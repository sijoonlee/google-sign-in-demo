import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
//import { GoogleLogin } from 'react-google-login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import classNames from 'classnames';

export async function getStaticProps() {
  return {
    props: {
      CLIENT_ID: process.env.CLIENT_ID,
    },
  }
}

export default function Home({ CLIENT_ID, someCallBack }) {

  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ hasError, setHasError ] = useState(false)
  const [ providerToken, setProviderToken ] = useState(null)
    
  const [isChecked, setIsChecked] = useState(false);
  const [token, setToken] = useState(null)

  const callbackRef = useRef()

  // working with isChecked change
  useEffect(() => {
    callbackRef.current = (cred) => {
      console.log("UseRef")
      console.log("isChecked", isChecked)
      console.log(cred.substring(0, 5))
      someCallBack?.(cred)
    }
  }, [isChecked])

  // Not working with isChecked change
  const callbackByUseCallback = useCallback((cred) => {
    console.log("use callback")
    console.log("isChecked", isChecked)
    console.log(cred.substring(0, 5))
    someCallBack?.(cred)
  }, [isChecked])

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const script = document.createElement('script');
  
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
  
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        // this function is responsible of handling RS256 token from google
        callback: resp => {
          setToken(resp.credential) // working properly
          callbackRef.current?.(resp.credential) // working properly
          callbackByUseCallback(resp.credential) // not working properly
        }
      })
      window.google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        {  theme: "outline", size:"large", width:220, locale:'en-CA' }
      )
      setIsLoaded(true)
    }
    script.onerror = () => {
      setHasError(true)
    }
    
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {
    if (token != null) {
      console.log("setToken", token.substring(0, 5), isChecked)
      someCallBack?.(token)
    }
  }, [token, isChecked])


  function handleChange(event) {
    setIsChecked(event.target.checked)
  }

  useEffect(() => {
    console.log(providerToken)
    // callbackFn (providerToken)

  }, [providerToken])

  return (
    <div
    style={{width:"500px"}}
    >
      <input 
        name="check"
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
      />
      <div
      style={{height:"42px"}}
        id="signInDiv"
        className={classNames({shouldHide: !isLoaded || hasError})}
      ></div>
    </div>
  )
}
