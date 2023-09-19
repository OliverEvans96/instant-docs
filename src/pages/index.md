---
title: Getting started
pageTitle: Instant - The Modern Firebase.
description: Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion.
---

Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion. **These are early days for Instant, there is much to build and we're excited for what's ahead**.

Want to instantly play with Instant? {% sandbox-link type="counter-example" label="Check out this sandbox" /%} for a simple example.

Have questions? {% blank-link href="https://discord.com/invite/GG44aqQGsh" label="Join us on discord!" /%}

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
import { init, useQuery, tx, transact } from '@instantdb/react'

const APP_ID = 'REPLACE ME'

init({
  appId: APP_ID,
  websocketURI: 'wss://api.instantdb.com/runtime/session',
})

const singletonId = '0c1b1794-87de-4b3c-8f11-b7b66290ffb0'

function App() {
  const query = {
    counters: {
      $: {
        where: {
          id: singletonId,
        },
      },
    },
  }
  const { isLoading, error, data } = useQuery(query)
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

  return <Counter data={data} />
}

function Counter({ data }) {
  const counter = data.counters[0]
  console.log('⚡ + ' + JSON.stringify(counter))
  const count = counter?.count || 0

  return (
    <button
      onClick={() =>
        transact([tx.counters[singletonId].update({ count: count + 1 })])
      }
    >
      {count}
    </button>
  )
}

export default App
```

Go to `localhost:3000` and follow the final instruction to load the app!

Huzzah 🎉 You've got your first Instant web app running! Check out the [**Explore**](/docs/init) section to learn more about how to use Instant :)
