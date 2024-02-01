---
title: Auth
---

## Magic Codes

Instant supports a "magic-code" flow for auth. Users provide their email, we send
them a login code on your behalf, and they authenticate with your app. Here's
how you can do it with react.

```javascript {% showCopy=true %}
import React, { useState } from 'react'
import { auth, useAuth } from '@instantdb/react'

function App() {
  const { isLoading, user, error } = useAuth()
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
    <div style={containerStyle}>
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
  return (
    <div style={formStyle}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Let's log you in!</h2>
      <div>
        <input
          style={inputStyle}
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <button
          style={buttonStyle}
          onClick={() => {
            if (!email) return
            setSentEmail(email)
            auth.sendMagicCode({ email }).catch((err) => {
              alert('Uh oh :' + err.body?.message)
              setSentEmail('')
            })
          }}
        >
          Send Code
        </button>
      </div>
    </div>
  )
}

function MagicCode({ sentEmail }) {
  const [code, setCode] = useState('')
  return (
    <div style={formStyle}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>
        Okay we sent you an email! What was the code?
      </h2>
      <div>
        <input
          style={inputStyle}
          type="text"
          placeholder="Code plz"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button
        style={buttonStyle}
        onClick={() => {
          auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
            alert('Uh oh :' + err.body?.message)
            setCode('')
          })
        }}
      >
        Verify
      </button>
    </div>
  )
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  fontFamily: 'Arial, sans-serif',
}

const inputStyle = {
  padding: '10px',
  marginBottom: '15px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  width: '300px',
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
}
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
  const { isLoading, user, error } = useAuth()
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
auth.sendMagicCode({ email }).catch((err) => {
  alert('Uh oh :' + err.body?.message)
  setState({ ...state, sentEmail: '' })
})
```

Use `auth.sendMagicCode` to create a magic code on instant's backend and email a login code

### auth.signInWithMagicCode

```javascript
auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
  alert('Uh oh :' + err.body?.message)
  setState({ ...state, code: '' })
})
```

Use `auth.signInWithMagicCode` to validate codes with instant's backend.

### auth.signOut

```javascript
auth.signOut()
```

Use `auth.signOut` to sign out users. This will restart the websocket connection and clear out the current user refresh token.

## Custom Auth

Want to do something more custom? You can roll your own authentication flows using the [Admin SDK](/docs/backend#custom-auth)!

### More methods coming

In the future we will provide more mechanisms for auth. If you have any requests, we're all ears!
