---
title: Getting started with Vanilla JS
---

You can use Instant with plain ol' Javascript too. You may find this helpful to integrate Instant with a framework that doesn't have an official SDK yet.

To use Instant in a non-react project you can install it like so

```
yarn add @instantdb/core
```

`@instantdb/core` exports three main functions, `init`, `subscribeQuery`, and `transact`

```javascript
import { init, subscribeQuery, transact } from '@instantdb/core'
```

`init` and `transact` work the same as `@instantdb/react`. To use `subscribeQuery` you may need to write additional logic
to integrate with your framework of choice.

For example, if we wanted to write our own `useQuery` hook using the `@instantdb/core` we could do it like so:

```javascript
import { getDB, weakHash } from '@instantdb/core'

import { useEffect, useState } from 'react'

export function useQuery(query) {
  const db = getDB()
  const [state, setState] = useState({ isLoading: true })
  useEffect(() => {
    setState({ isLoading: true })
    const unsub = db.subscribeQuery(query, (resp) => {
      setState({ isLoading: false, ...resp })
    })
    return unsub
  }, [weakHash(query)])

  return state
}
```

We love contributions so if you write your own SDK {% blank-link href="https://discord.com/invite/GG44aqQGsh" label="let us know on discord!" /%}

Continue on to the [next section](/docs/init) to learn more about how to use Instant :)
