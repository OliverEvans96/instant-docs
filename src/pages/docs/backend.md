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

## More SDKs to come

In the future we will expose an HTTP API so you can use Instant with your
language of choice. Stay tuned!
