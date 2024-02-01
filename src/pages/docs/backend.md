---
title: Instant on the Backend
---

You can use Instant on the server as well! This can be especially useful for
running scripts, custom auth flows, or sensitive application logic.

## Admin SDK

We currently offer a javascript library `@instantdb/admin` for using Instant in
a non-browser context. This library is similar to our client SDK with a few
tweaks.

### init

```javascript
import { init } from '@instantdb/admin'

init({
  appId: 'my-instant-app-id',
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN,
})
```

Similar to `@instantdb/react`, you must `init` before doing any queries or
writes. Running `init` authenticates you against our admin API. In addition to
providing your `appId`, you must also provide your `adminToken`.

{% callout type="warning" %}

Whereas exposing your `appId` in source control is fine, it's not safe
to expose your admin token. Permission checks will not run for queries and
writes from our admin API. Be sure to regenerate your token from your dashboard
if it accidently leaks.

{% /callout %}

## Reading and Writing Data

`query` and `transact` let you read and write data as an admin.

### query

```javascript
import { query } from '@instantdb/admin'
const data = await query({ books: {}, users: {} })
const { books, users } = data
```

In react we export `useQuery` to enable "live queries", queries that will
automatically update when data changes.

In the admin SDK we instead export an async `query` function that simply fires a
query once and returns a result.

### transact

```javascript
import { tx, id, transact } from "@instantdb/admin"

const today = format(new Date(), 'MM-dd-yyyy');
const res  = await transact([
  tx.logs[id()].update({ date: today })
])
console.log("New log entry made for" today, "with tx-id", res["tx-id"])
```

`transact` is an async function that behaviors nearly identical to `transact`
from `@instantdb/react`. It returns a `tx-id` on success.

## Custom Auth

You can use the Admin SDK to create your own authentication flows. You'd typically make a change on both your backend and frontend:

### Backend: auth.createToken

On the backend, `auth.createToken` lets you create users and generate login tokens for them.

If you had an endpoint, here's how that could look:

```javascript
import { auth } from '@instantdb/admin'

app.post('/custom_sign_in', async (req, res) => {
  // ... your custom flow for users
  const token = await auth.createToken(email)
  return res.status(200).send({ token })
})
```

If a user with this email does not exist, `auth.createToken` will create a user for you.

{% callout type="note" %}

Right now we require that every user _must_ have an email. If you need to relax this constraint let us know.

{% /callout %}

### Frontend: auth.signInWithToken

Once you generate the token, you can pass it along to your frontend and sign in with `auth.signInWithToken`:

```javascript
import {auth} from '@instantdb/react'

async function handleSignIn() {
  // Get the token from your backend
  const token = await fetch('/signin', ...);
  // Sign in
  auth.signInWithToken(token);
}
```

## Custom Endpoints

Sometimes you'll want to write custom endpoints in your backend. You can use the admin SDK to authenticate users on those endpoints.

### Backend: auth.verifyToken

In your endpoint, you can expect to receive `token`. You can then use `auth.verifyToken` to get the associated user. For example:

```javascript
app.post('/custom_endpoint', async (req, res) => {
  // verify the token this user passed in
  const user = await auth.verifyToken(req.headers['token'])
  if (!user) {
    return res.status(400).send('Uh oh, you are not authenticated')
  }
  // ...
})
```

### Frontend: user.refresh_token

In your frontend, the `user` object has a `refresh_token` property. You can pass this token on to your endpoint:

```javascript
import { useAuth } from '@instantdb/react'

function App() {
  const { user } = useAuth();
  // call your api with `user.refresh_token`
  function onClick() {
    myAPI.customEndpoint(user.refresh_token, ...);
  }
}
```

## More SDKs to come

In the future we will expose an HTTP API so you can use Instant with your
language of choice. Stay tuned!
