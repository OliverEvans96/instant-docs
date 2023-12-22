---
title: Auth
---

## Magic Codes

Instant supports a "magic-code" flow for auth. Users provide their email, we send
them a login code on your behalf, and they authenticate with your app. Here's
how you can do it with react.

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

### auth.verifyMagicCode

```javascript
.verifyMagicCode({ email: sentEmail, code })
.catch((err) => {
  alert("Uh oh :" + err.body?.message);
  setState({ ...state, code: "" });
});
```

Use `auth.verifyMagicCode` to validate codes with instant's backend.

### auth.signOut

```javascript
auth.signOut()
```

Use `auth.signOut` to sign out users. This will restart the websocket connection and clear out the current user refresh token.

### Putting it all together

```javascript
import React, { useState } from 'react'
import { auth } from '@instantdb/react'

function Login() {
  const [state, setState] = useState({
    sentEmail: '',
    email: '',
    code: '',
  })
  const { sentEmail, email, code } = state
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div>
        {!sentEmail ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <h2 style={{ color: '#333', marginBottom: '20px' }}>
              Let's log you in!
            </h2>
            <div>
              <input
                style={{
                  padding: '10px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  width: '300px',
                }}
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
              />
            </div>
            <div>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (!email) return
                  setState({ ...state, sentEmail: email })
                  auth.sendMagicCode({ email }).catch((err) => {
                    alert('Uh oh :' + err.body?.message)
                    setState({ ...state, sentEmail: '' })
                  })
                }}
              >
                Send Code
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <h2 style={{ color: '#333', marginBottom: '20px' }}>
              Okay we sent you an email! What was the code?
            </h2>
            <div>
              <input
                style={{
                  padding: '10px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  width: '300px',
                }}
                type="text"
                placeholder="Code plz"
                value={code || ''}
                onChange={(e) => setState({ ...state, code: e.target.value })}
              />
            </div>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                auth
                  .verifyMagicCode({ email: sentEmail, code })
                  .catch((err) => {
                    alert('Uh oh :' + err.body?.message)
                    setState({ ...state, code: '' })
                  })
              }}
            >
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
```

Here we create a `Login` component to handle our auth flow. Of note is `auth.sendMagicCode`
and `auth.verifyMagicCode`.

On successful validation, Instant's backend will return a user object with a refresh token.
The client SDK will then restart the websocket connection with Instant's sync layer and provide the refresh token.

When doing `useQuery` or `transact`, the refresh token will be used to hydrate `auth`
on the backend during permission checks.

On the client, `useAuth` will set `isLoading` to `false` and populate `user` -- huzzah!

## More auth methods coming

In the future we will provide more mechanisms for auth. If you have any requests, we're all ears!
