---
title: useInit
---

Before using `useQuery` or `transact`, make sure `useInit` is called in your component tree.

```javascript
import { useEffect } from 'react'

import { useInit, useQuery, tx, transact } from '@instantdb/react'

const APP_ID = "REPLACE ME";

function App() {
    const [isLoading, error, auth] = useInit({
        appId: APP_ID,
        websocketURI: 'wss://instant-server-clj.herokuapp.com/api/runtime/sync',
        apiURI: 'https://instant-server-clj.herokuapp.com/api',
    })
    // Render a loading state while initializing
    if (isLoading) {
        return <div>...</div>
    }
    // Render an error state if initialization fails
    if (error) {
        return <div>Oi! {error?.message}</div>
    }
    return <Counter />
}
```

You can now use `useQuery` and `transact` throughout your component tree

```javascript
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
```
