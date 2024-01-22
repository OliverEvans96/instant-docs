---
title: Getting started with Vanilla JS
---

You can use Instant with plain ol' Javascript too. You may find this helpful to integrate Instant with a framework that doesn't have an official SDK yet.

To use Instant in a non-react project you can install it like so

```bash
npm i @instantdb/core
```

Now you can import the main functions:

```javascript
import { init, getDB, subscribeQuery, transact, tx } from '@instantdb/core'
```

## init

`init` works the same as in `@instantdb/react`:

```javascript
const APP_ID = 'REPLACE ME'

init({ appId: APP_ID })
```

## Writing Data

`transact` works the same too:

```javascript
transact([tx.goals[id()].update({ title: 'eat' })])
```

To learn more writing transactions, check out the [**Writing Data**](/docs/instaml) section.

## Reading Data

Now that you have your database up and running, you can subscribe to queries:

```javascript
const query = { goals: {} }
// get the database you inited
const db = getDB()
// subscribe a query
const unsub = db.subscribeQuery(query, (resp) => {
  if (resp.error) {
    console.error('Uh oh!', resp.error.message)
  }
  if (resp.data) {
    console.log('Data!', resp.data)
  }
})
```

Continue on to the [Explore section](/docs/init) to learn more about how to use Instant :)
