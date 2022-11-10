---
title: InstaQL
---

Instant provides a **GraphQL-like** interface for querying. We call our query language **InstaQL**

## Why InstaQL
We like the declarative nature of GraphQL queries but are not fans of **a) configuration**
and **b) build steps** required to get up and running. To get around **a) and b)** we built InstaQL using only native javascript arrays and objects.

## Fetch namespace
These next sections will use the following sample data:

```javascript
transact([
  tx.todos["workout"].update({title: "Go on a run"}),
  tx.todos["protein"].update({title: "Drink protein"}),
  tx.todos["sleep"].update({title: "Go to bed early"}),
  tx.todos["standup"].update({title: "Do standup"}),
  tx.todos["reviewPRs"].update({title: "Review PRs"}),
  tx.todos["focus"].update({title: "Code a bunch"}),
  tx.goals["health"].update({title: "Get fit!"})
    .link({ todo: "workout"})
    .link({ todo: "protein"})
    .link({ todo: "sleep"})
  tx.goals["work"].update({title: "Get promoted!"})
    .link({ todo: "standup"})
    .link({ todo: "reviewPRs"})
    .link({ todo: "focus"})
])
```

Here we have:
* todos, identified as `workout`, `protein`, `sleep`, `standup`, `reviewPRs`, and `focus`
* goals, identified as `health` and `work`
* todos `workout`, `protein`, and `sleep` are associated with goal `health`
* todos `standup`, `reviewPRs`, and `focus` are associated with goal `work`
---
One of the simpliest queries you can write is to simply get all entities of a namespace.

```javascript
const query = {goals: {}}
const data = useQuery(query)
```

Inspecting `data`, we'll see:

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "health",
      "title": "Get fit!"
    },
    {
      "id": "work",
      "title": "Get promoted!"
    }
  ]
}
```

For comparison, the SQL equivalent of this would be something like:
```javascript
const data = {goals: doSQL("SELECT * FROM goals")}
```

## Fetch multiple namespaces
You can fetch multiple namespaces at once:

```javascript
const query = {goals: {}, todos: {}}
const data = useQuery(query)
```

We will now see data for both namespaces.
```javascript
console.log(data)
{
  "goals": [...],
  "todos": [
    {
      "id": "focus",
      "title": "Code a bunch"
    },
    {
      "id": "protein",
      "title": "Drink protein"
    },
    ...
  ]
}
```

The equivalent of this in SQL would be to write two separate queries.
```javascript
const data = {
  goals: doSQL("SELECT * from goals"),
  todos: doSQL("SELECT * from todos")
}
```

## Fetch a specific entity
If you want to filter entities, you can use the `where` keyword. Here we fetch a specific goal

```javascript
const query = {
  "goals": {
    "$": {
      "where": {
        "id": "health"
      }
    }
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "health",
      "title": "Get fit!"
    }
  ]
}
```

The SQL equivalent would be:
```javascript
const data = {goals: doSQL("SELECT * FROM goals WHERE id = 'health'")}
```

Notice how results are returned as an array. If you want to get query results back as single object you can use the `cardinality` keyword
```javascript
const query = {
  "goals": {
    "$": {
      "where": {
        "id": "health"
      },
      "cardinality": "one"
    }
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "goals": {
    "id": "health",
    "title": "Get fit!"
  }
}
```

## Fetch associations
We can fetch goals and their related todos.

```javascript
const query = {
  "goals": {
    "todos": {}
  }
}
const data = useQuery(query)
```

`goals` would now include nested `todos`

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "health",
      "title": "Get fit!",
      "todos": [...],
    },
    {
      "id": "work",
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
  "goals": {
    "todos": {}
  }
}
const data = useQuery(query)
```

Modern applications often need to render nested relations, `InstaQL` really starts to shine for these use cases.

## Fetch specific associations

### A) Fetch associations for filtered namespace
We can fetch a specific entity in a namespace as well as it's related associations.
```javascript
const query = {
  "goals": {
    "$": {
      "where": {
        "id": "health"
      }
    },
    "todos": {}
  }
}
const data = useQuery(query)
```

Which returns

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "health",
      "title": "Get fit!",
      "todos": [
        {
          "id": "protein",
          "title": "Drink protein"
        },
        {
          "id": "sleep",
          "title": "Go to bed early"
        },
        {
          "id": "workout",
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
  "goals": {
    "$": {
      "where": {
        "todos.title": "Code a bunch"
      }
    },
    "todos": {}
  }
}
const data = useQuery(query)
```

Returns

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "work",
      "title": "Get promoted!",
      "todos": [
        {
          "id": "focus",
          "title": "Code a bunch"
        },
        {
          "id": "reviewPRs",
          "title": "Review PRs"
        },
        {
          "id": "standup",
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
  "goals": {
    "$": {
      "where": {
        "todos.title": "Go on a run"
      }
    }
  }
}
const data = useQuery(query)
```

This will return goals and filtered todos

```javascript
console.log(data)
{
  "goals": [
    {
      "id": "health",
      "title": "Get fit!",
      "todos": [
        {
          "id": "workout",
          "title": "Go on a run"
        }
      ]
    },
    {
      "id": "work",
      "title": "Get promoted!",
      "todos": []
    }
  ]
}
```

---
{% callout %}
Notice the difference between these three cases.
* A) Fetched all todos for goal with id `health`
* B) Filtered goals with a least one todo titled `Code a bunch`
* C) Fetched all goals and filtered associated todos by title `Go on a run`
{% /callout %}
---

## Inverse Associations
Earlier we showed how we can get goals and their associated todos. What if we wanted
to grab todos and their associated goals? To grab associations in the reverse direction
we use the `_` prefix.

```javascript
const query = {
  "todos": {
    "_goals": {}
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "todos": [
    {
      "id": "focus",
      "title": "Code a bunch",
      "_goals": [
        {
          "id": "work",
          "title": "Get promoted!"
        }
      ]
    },
    ...,
  ]
}
```

## Alias Namespace
You probably would prefer getting rid of the `_` in your query results when fetching inverse assocations. You can use the `is` keyword to alias namespaces.

```jacascript
const query = {
  "todos": {
    "goals": {
      "$": {
        "is": "_goals"
      }
    }
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "todos": [
    {
      "id": "focus",
      "title": "Code a bunch",
      "goals": [
        {
          "id": "work",
          "title": "Get promoted!"
        }
      ]
    },
    ...,
  ]
}
```

We aliased `_goals` to `goals`, but you're not restricted to dropping the `_`, we could have renamed the key to `priorities`.

```javascript
const query = {
  "todos": {
    "priorities": {
      "$": {
        "is": "_goals"
      }
    }
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "todos": [
    {
      "id": "focus",
      "title": "Code a bunch",
      "priorities": [
        {
          "id": "work",
          "title": "Get promoted!"
        }
      ]
    },
    ...,
  ]
}
```

## Disambiguate Namespace
For this section let's use some new example data.

```javascript
transact([
  tx.users["joe"].update({name: "Joe"}),
  tx.users["stopa"].update({name: "Stopa"}),
  tx.posts["essay"].update({title: "Graph Based Firebase"})
    .link({ author: "stopa" })
    .link({ editor: "joe" }),
])
```

Here we have:
* users, identified as `joe` and `stopa`
* A post, identified as `essay` which was authored by user `stopa` and edited by user `joe`.

It's straightforward to fetch authors and editors for posts.

```javascript
const query = {
  "posts": {
    "author": {},
    "editor": {}
  }
})
const data = useQuery(query)
```

But what if we wanted to fetch users and their associated posts? In this case we'll need to disambiguate between authored posts and edited posts. We can do so via `through` and alias via `is`.

```javascript
const query = {
  "users": {
    "authoredPosts": {
      "$": {
        "through": "author",
        "is": "_posts"
      }
    },
    "editedPosts": {
      "$": {
        "through": "editor",
        "is": "_posts"
      }
    }
  }
}
const data = useQuery(query)
```

```javascript
console.log(data)
{
  "users": [
    {
      "id": "joe",
      "name": "Joe",
      "authoredPosts": [],
      "editedPosts": [
        {
          "id": "essay",
          "title": "Graph Based Firebase"
        }
      ]
    },
    {
      "id": "stopa",
      "name": "Stopa",
      "authoredPosts": [
        {
          "id": "essay",
          "title": "Graph Based Firebase"
        }
      ],
      "editedPosts": []
    }
  ]
}
```

What would happen if you didn't disambiguate and tried using the reverse relation instead?

```javascript
const query = {"users": {_posts: {}}}
const data = useQuery(query)
```

It might not work as you expect. You'd get back the following
```javascript
console.log(data)
{
  "users": [
    {
      "id": "joe",
      "name": "Joe",
      "_posts": []
    },
    {
      "id": "stopa",
      "name": "Stopa",
      "_posts": []
    }
  ]
}
```

This happens because of how we created our link

```javascript
tx.posts["essay"].update({title: "Graph Based Firebase"})
  .link({ author: "stopa" })
  .link({ editor: "joe" }),
```

We specify that post `essay` is associated with user `stopa` __through__ `author` and associated with user `joe` __through__ `editor`.

This makes it straightforward to go from `post` -> `author`, and `post` -> `editor`.
```javascript
const query = {
  "posts": {
    "author": {},
    "editor": {}
  }
})
const data = useQuery(query)
```

But the reverse direction is more tricky. To go from `user` -> `post` we need to specify a `through` key.

* `user` -> `author` -> `post`
```javascript
const query = {"users": {_posts: {$: {through: "author"}}}}
const data = useQuery(query)
```
* `user` -> `editor` -> `post`.
```javascript
const query = {"users": {_posts: {$: {through: "editor"}}}}
const data = useQuery(query)
```

Finally, if we want to include both authored and edited posts in one query we can use `is` to alias.

```javascript
const query = {
  "users": {
    "authoredPosts": {
      "$": {
        "through": "author",
        "is": "_posts"
      }
    },
    "editedPosts": {
      "$": {
        "through": "editor",
        "is": "_posts"
      }
    }
  }
}
const data = useQuery(query)
```
