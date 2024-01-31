---
title: Instant on the Backend
---

You can use Instant on the server as well! This can be especially useful for
running scripts or running sensitive application logic.

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
writes. Running `init` authenticate you against our admin API. In addition to
providing your `appId`, you must also provide your `adminToken` when doing `init`

{% callout type="warning" %}

Whereas exposing your `appId` in source control is fine, it's not safe
to expose your admin token. Permission checks will not run for queries and
writes from our admin API. Be sure to regenerate your token from your dashboard
if it accidently leaks.

{% /callout %}

### query

```javascript
import { query } from '@instantdb/admin'
const data = await query({ books: {}, users: {} })
const { books, users } = data
```

In react we export `useQuery` to enable `live queries`, queries that will
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
from @`instantdb/react`. It returns a `tx-id` on success.

## Custom Auth

You can also use the Admin SDK to roll your own custom auth flows.

### auth.createToken

Once you know you want to sign up a user, you can create a token for them.

Here's how it could look on the backend:

```javascript
import { auth } from '@instantdb/admin'

app.post('/signin', async (req, res) => {
  // your custom flow for users
  return res.status(200).send({ token: await auth.createToken(email) })
})

const token = await auth.createToken('stepan.p@gmail.com')
```

If a user with this email exists, you'll get a token them. If a user does not exist, we'll create them for you.

Once you have a token, you can use it in your frontend.

```javascript
import {auth} from '@instantdb/react'

// your frontend code
async function handleSignIn() {
  // get the token from your backend
  const token = await fetch('/signin', ...);
  // sign the user in through Instant
  auth.signInWithToken(token);
}

```

### auth.verifyToken

You can also accept tokens from the frontend. For example, say you want to make a special endpoint, and want to authenticate your users.

From the frontend, you can send the current token:

```javascript
import { useAuth } from '@instantdb/react'

function App() {
  const { user } = useAuth();
  // ...
  function onClick() {
    yourBackend.apiCall(user.refresh_token, ...);
  }
}
```

And in your endpoint, you can verify it:

```javascript
app.post('/verify', async (req, res) => {
  // verify the token this user passed in
  const user = await auth.verifyToken(req.headers['token'])
})
```

## More SDKs to come

In the future we will expose an HTTP API so you can use Instant with your
language of choice. Stay tuned!
