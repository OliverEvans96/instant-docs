---
title: Reading data
---

Instant provides a **GraphQL-like** interface for querying. We call our query language **InstaQL**

## Why InstaQL

We like the declarative nature of GraphQL queries but are not fans of **a) configuration**
and **b) build steps** required to get up and running. To get around **a) and b)** we built InstaQL using only native javascript arrays and objects.

## Fetch namespace

These next sections will use the following sample data:

```javascript
import { id, transact, tx } from '@instantdb/react'

const workoutId = id()
const proteinId = id()
const sleepId = id()
const standupId = id()
const reviewPRsId = id()
const focusId = id()
const healthId = id()
const workId = id()

transact([
  tx.todos[workoutId].update({ title: 'Go on a run' }),
  tx.todos[proteinId].update({ title: 'Drink protein' }),
  tx.todos[sleepId].update({ title: 'Go to bed early' }),
  tx.todos[standupId].update({ title: 'Do standup' }),
  tx.todos[reviewPRsId].update({ title: 'Review PRs' }),
  tx.todos[focusId].update({ title: 'Code a bunch' }),
  tx.goals[healthId]
    .update({ title: 'Get fit!' })
    .link({ todos: workoutId })
    .link({ todos: proteinId })
    .link({ todos: sleepId }),
  tx.goals[workId]
    .update({ title: 'Get promoted!' })
    .link({ todos: standupId })
    .link({ todos: reviewPRsId })
    .link({ todos: focusId }),
])
```

Here we have:

- todos, with unique identifiers `workoutId`, `proteinId`, `sleepId`, `standupId`, `reviewPRsId`, and `focusId`
- goals, with unique identifiers `healthId` and `workId`
- todos `workoutId`, `proteinId`, and `sleepId` are associated with goal `health`
- todos `standupId`, `reviewPRsId`, and `focusId` are associated with goal `work`

---

One of the simpliest queries you can write is to simply get all entities of a namespace.

```javascript
const query = { goals: {} }
const { isLoading, error, data } = useQuery(query)
```

Inspecting `data`, we'll see:

```javascript
console.log(data)
{
  "goals": [
    {
      "id": healthId,
      "title": "Get fit!"
    },
    {
      "id": workId,
      "title": "Get promoted!"
    }
  ]
}
```

For comparison, the SQL equivalent of this would be something like:

```javascript
const data = { goals: doSQL('SELECT * FROM goals') }
```

## Fetch multiple namespaces

You can fetch multiple namespaces at once:

```javascript
const query = { goals: {}, todos: {} }
const { isLoading, error, data } = useQuery(query)
```

We will now see data for both namespaces.

```javascript
console.log(data)
{
  "goals": [...],
  "todos": [
    {
      "id": focusId,
      "title": "Code a bunch"
    },
    {
      "id": proteinId,
      "title": "Drink protein"
    },
    ...
  ]
}
```

The equivalent of this in SQL would be to write two separate queries.

```javascript
const data = {
  goals: doSQL('SELECT * from goals'),
  todos: doSQL('SELECT * from todos'),
}
```

## Fetch a specific entity

If you want to filter entities, you can use the `where` keyword. Here we fetch a specific goal

```javascript
const query = {
  goals: {
    $: {
      where: {
        id: 'health',
      },
    },
  },
}
const { isLoading, error, data } = useQuery(query)
```

```javascript
console.log(data)
{
  "goals": [
    {
      "id": healthId,
      "title": "Get fit!"
    }
  ]
}
```

The SQL equivalent would be:

```javascript
const data = { goals: doSQL("SELECT * FROM goals WHERE id = 'health'") }
```

## Fetch associations

We can fetch goals and their related todos.

```javascript
const query = {
  goals: {
    todos: {},
  },
}
const { isLoading, error, data } = useQuery(query)
```

`goals` would now include nested `todos`

```javascript
console.log(data)
{
  "goals": [
    {
      "id": healthId,
      "title": "Get fit!",
      "todos": [...],
    },
    {
      "id": workId,
      "title": "Get promoted!",
      "todos": [...],
    }
  ]
}
```

### Comparing InstaQL vs SQL

The SQL equivalent for this would be something along the lines of:

```javascript
const query = "
SELECT g.*, gt.todos
FROM goals g
JOIN (
    SELECT g.id, json_agg(t.*) as todos
    FROM goals g
    LEFT JOIN todos t on g.id = t.goal_id
    GROUP BY 1
) gt on g.id = gt.id
"
const data = {goals: doSQL(query)}
```

Notice the complexity of this SQL query. Although fetching associations in SQL is straightforward via `JOIN`, marshalling the results in a nested structure via SQL is tricky. An alternative approach would be to write two straight-forward queries and then marshall the data on the client.

```javascript
const _goals = doSQL("SELECT * from goals")
const _todos = doSQL("SELECT * from todos")
const data = {goals: _goals.map(g => (
  return {...g, todos: _todos.filter(t => t.goal_id === g.id)}
))
```

Now compare these two approaches with `InstaQL`

```javascript
const query = {
  goals: {
    todos: {},
  },
}
const { isLoading, error, data } = useQuery(query)
```

Modern applications often need to render nested relations, `InstaQL` really starts to shine for these use cases.

## Fetch specific associations

### A) Fetch associations for filtered namespace

We can fetch a specific entity in a namespace as well as it's related associations.

```javascript
const query = {
  goals: {
    $: {
      where: {
        id: 'health',
      },
    },
    todos: {},
  },
}
const { isLoading, error, data } = useQuery(query)
```

Which returns

```javascript
console.log(data)
{
  "goals": [
    {
      "id": healthId,
      "title": "Get fit!",
      "todos": [
        {
          "id": proteinId,
          "title": "Drink protein"
        },
        {
          "id": sleepId,
          "title": "Go to bed early"
        },
        {
          "id": workoutId,
          "title": "Go on a run"
        }
      ]
    }
  ]
}
```

### B) Filter namespace by associated values

We can filter namespaces **by their associations**

```javascript
const query = {
  goals: {
    $: {
      where: {
        'todos.title': 'Code a bunch',
      },
    },
    todos: {},
  },
}
const { isLoading, error, data } = useQuery(query)
```

Returns

```javascript
console.log(data)
{
  "goals": [
    {
      "id": workId,
      "title": "Get promoted!",
      "todos": [
        {
          "id": focusId,
          "title": "Code a bunch"
        },
        {
          "id": reviewPRsId,
          "title": "Review PRs"
        },
        {
          "id": standupId,
          "title": "Do standup"
        }
      ]
    }
  ]
}
```

### C) Filter associations

We can also filter associated data.

```javascript
const query = {
  goals: {
    $: {
      where: {
        'todos.title': 'Go on a run',
      },
    },
  },
}
const { isLoading, error, data } = useQuery(query)
```

This will return goals and filtered todos

```javascript
console.log(data)
{
  "goals": [
    {
      "id": healthId,
      "title": "Get fit!",
      "todos": [
        {
          "id": workoutId,
          "title": "Go on a run"
        }
      ]
    },
    {
      "id": workId,
      "title": "Get promoted!",
      "todos": []
    }
  ]
}
```

---

{% callout %}
Notice the difference between these three cases.

- A) Fetched all todos for goal with id `health`
- B) Filtered goals with a least one todo titled `Code a bunch`
- C) Fetched all goals and filtered associated todos by title `Go on a run`

{% /callout %}

---

## Inverse Associations

Associations are also available in the reverse order.

```javascript
const query = {
  todos: {
    goals: {},
  },
}
const { isLoading, error, data } = useQuery(query)
```

```javascript
console.log(data)
{
  "todos": [
    {
      "id": focusId,
      "title": "Code a bunch",
      "goals": [
        {
          "id": workId,
          "title": "Get promoted!"
        }
      ]
    },
    ...,
  ]
}
```

## More features to come!

We're actively building more features for InstaQL. {% blank-link href="https://discord.com/invite/GG44aqQGsh" label="Let us know on discord" /%} if there's a missing feature you'd love for us to add!
