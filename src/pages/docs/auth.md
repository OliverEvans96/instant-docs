---
title: Auth
---

[Magic Codes](#magic-codes)

[Log in with Google](#log-in-with-google)

[Custom Auth](#custom-auth)

## Magic Codes

Instant supports a "magic-code" flow for auth. Users provide their email, we send
them a login code on your behalf, and they authenticate with your app. Here's
how you can do it with react.

```javascript {% showCopy=true %}
'use client'

import React, { useState } from 'react'
import { init } from '@instantdb/react'

const APP_ID = 'REPLACE ME'

const db = init({ appId: APP_ID })

function App() {
  const { isLoading, user, error } = db.useAuth()
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Uh oh! {error.message}</div>
  }
  if (user) {
    return <h1>Hello {user.email}!</h1>
  }
  return <Login />
}

function Login() {
  const [sentEmail, setSentEmail] = useState('')
  return (
    <div style={authStyles.container}>
      {!sentEmail ? (
        <Email setSentEmail={setSentEmail} />
      ) : (
        <MagicCode sentEmail={sentEmail} />
      )}
    </div>
  )
}

function Email({ setSentEmail }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    setSentEmail(email)
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Uh oh :' + err.body?.message)
      setSentEmail('')
    })
  }

  return (
    <form onSubmit={handleSubmit} style={authStyles.form}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Let's log you in!</h2>
      <div>
        <input
          style={authStyles.input}
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" style={authStyles.button}>
          Send Code
        </button>
      </div>
    </form>
  )
}

function MagicCode({ sentEmail }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      alert('Uh oh :' + err.body?.message)
      setCode('')
    })
  }

  return (
    <form onSubmit={handleSubmit} style={authStyles.form}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>
        Okay, we sent you an email! What was the code?
      </h2>
      <div>
        <input
          style={authStyles.input}
          type="text"
          placeholder="123456..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button type="submit" style={authStyles.button}>
        Verify
      </button>
    </form>
  )
}

const authStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    width: '300px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
}

export default App
```

This creates a `Login` component to handle our auth flow. Of note is `auth.sendMagicCode`
and `auth.signInWithMagicCode`.

On successful validation, Instant's backend will return a user object with a refresh token.
The client SDK will then restart the websocket connection with Instant's sync layer and provide the refresh token.

When doing `useQuery` or `transact`, the refresh token will be used to hydrate `auth`
on the backend during permission checks.

On the client, `useAuth` will set `isLoading` to `false` and populate `user` -- huzzah!

### useAuth

```javascript
function App() {
  const { isLoading, user, error } = db.useAuth()
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Uh oh! {error.message}</div>
  }
  if (user) {
    return <Main />
  }
  return <Login />
}
```

Use `useAuth` to fetch the current user. Here we guard against loading
our `Main` component until a user is logged in

### auth.sendMagicCode

```javascript
db.auth.sendMagicCode({ email }).catch((err) => {
  alert('Uh oh :' + err.body?.message)
  setState({ ...state, sentEmail: '' })
})
```

Use `auth.sendMagicCode` to create a magic code on instant's backend and email a login code

### auth.signInWithMagicCode

```javascript
db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
  alert('Uh oh :' + err.body?.message)
  setState({ ...state, code: '' })
})
```

Use `auth.signInWithMagicCode` to validate codes with instant's backend.

### auth.signOut

```javascript
db.auth.signOut()
```

Use `auth.signOut` to sign out users. This will restart the websocket connection and clear out the current user refresh token.

## Log in with Google

Instant supports logging in your users with their Google account.

### Step 1: Create an OAuth client for Google

Go to the [Google Console](https://console.cloud.google.com/apis/credentials).

Click "+ CREATE CREDENTIALS"

Select "OAuth client ID"

Select "Web application" as the application type.

Add `https://api.instantdb.com/runtime/oauth/callback` as an Authorized redirect URI.

### Step 2: Register your OAuth client with Instant

Go to the Instant dashboard and select the `Auth` tab for your app.

Register a Google client and enter the client id and client secret from the OAuth client that you created.

### Step 3: Register your website with Instant

In the `Auth` tab, add the url of the websites where you are using Instant.

### Step 4: Update your code

Create an authorization URL

```javascript
const url = db.auth.createAuthorizationURL({
  // The name of the client you chose when you created it on the
  // Instant dashboard
  clientName: 'google-web',
  redirectURL: window.location.href,
})
```

Use it in your login link:

```jsx
<a href={url}>Log in with Google</a>
```

When your users clicks on the link, they'll be redirected to Google to start the OAuth flow and then back to your site.

Instant will automatically log them in to your app when they are redirected.

## Custom Auth

Want to do something more custom? You can roll your own authentication flows using the [Admin SDK](/docs/backend#custom-auth)!

### More methods coming

In the future we will provide more mechanisms for auth. If you have any requests, we're all ears!
