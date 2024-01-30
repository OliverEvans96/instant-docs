---
title: Getting started
pageTitle: Instant - The Modern Firebase.
description: Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion.
---

Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like FIgma or Notion. **These are early days for Instant, there is much to build and we're excited for what's ahead**.

Have questions? {% blank-link href="https://discord.com/invite/GG44aqQGsh" label="Join us on discord!" /%}

---

## Quick start

To use Instant in a brand new project fire up your terminal and do the following:

```shell {% showCopy=true %}
npx create-next-app -e hello-world instant-demo
cd instant-demo
npm i @instantdb/react
npm run dev
```

Now open up `app/page.tsx` in your favorite editor and replace the entirity of the file with the following code.

```javascript {% showCopy=true %}
'use client'

import { init, useQuery, tx, transact } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'

init({ appId: APP_ID })

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
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
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
