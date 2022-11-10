---
title: Getting started
pageTitle: Instant - The Modern Firebase.
description: Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion.
---

Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion.

Want to instantly play with Instant? {% sandbox-link type="counter-example" label="Check out this sandbox" /%} for a simple example.

Have questions? {% blank-link href="https://discord.gg/VU53p7uQcE" label="Join us on discord!" /%}

---

## Quick start

To use Instant in a brand new project fire up your terminal and do the following:

```shell
npx create-react-app instant-demo
cd instant-demo
npm i @instantdb/react
npm start
```

Now open up `src/App.js` in your favorite editor and replace the entirity of the file with the following code.

```javascript
import { useEffect } from 'react'

import { useInit, useQuery, tx, transact } from '@instantdb/react'

const APP_ID = 'REPLACE ME'

function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: 'wss://instant-server-clj.herokuapp.com/api/runtime/sync',
    apiURI: 'https://instant-server-clj.herokuapp.com/api',
  })
  if (isLoading) {
    return (
      <div>
        If you are seeing this you likely need to replace <b>APP_ID</b> on line
        5<br />
        <br />
        You can get your APP_ID by{' '}
        <a href="https://instantdb.com/dash" target="_blank" rel="noreferrer">
          logging into your Instant dashboard
        </a>
        . After replacing the id you may need to reload the page.
      </div>
    )
  }
  if (error) {
    return <div>Oi! {error?.message}</div>
  }
  return <Counter />
}

function Counter() {
  const query = {
    counter: {
      $: {
        where: {
          id: 'singleton',
        },
        cardinality: 'one',
      },
    },
  }
  const { counter } = useQuery(query)
  const count = counter?.count || 0
  useEffect(() => {
    if (!count) {
      transact([tx.counter['singleton'].update({ count: 1 })])
    }
  }, [])
  return (
    <button
      onClick={() =>
        transact([tx.counter['singleton'].update({ count: count + 1 })])
      }
    >
      {count}
    </button>
  )
}

export default App
```

Go to `localhost:3000` and follow the final instruction to load the app!

Huzzah 🎉 You've got your first Instant app running. Check out the next sections to learn more about how to use Instant :)
