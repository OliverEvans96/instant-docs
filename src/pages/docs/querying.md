---
title: InstaQL
---

Instant provides a GraphQL-like interface for querying. We call this *InstaQL*.

## Why InstaQL
We like the declarative nature of GraphQL queries but are not fans of **a) configuration**
and and **b) build steps** required to get up and running. To get around **a) and b)** we built InstaQL using only native javascript arrays and objects.

## Fetch namespace
One of the simpliest queries you can write is to simply get all records of a namespace.

```javascript
const data = useQuery({ goals: {} });
```

Inspecting `data`, we'll see:

```javascript
console.log(data);
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
const data = {goals: doSQL("SELECT * FROM goals")};
```

## Fetch multiple namespaces
You can fetch multiple namespaces at once:

```javascript
const data = useQuery({ goals: {}, todos: {} })
```

We will now see data for both namespaces.
```javascript
console.log(data);
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

## Fetch a specific record
If you want to filter results, you can use the `where` keyword. Here we fetch a specific goal

```javascript
const data = useQuery(
  {
    "goals": {
      "$": {
        "where": {
          "id": "health"
        }
      }
    }
  }
)

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
const data = {goals: doSQL("SELECT * FROM goals WHERE id = 'health'")};
```

Notice how results are returned as an array. If you want to get query results back as single object you can use the `cardinality` keyword
```javascript
const data = useQuery(
  {
    "goals": {
      "$": {
        "where": {
          "id": "health"
        },
        "cardinality": "one"
      }
    }
  }
);
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
Suppose we wanted to fetch goals and their related todos. We could do so as follows:

```javascript
const data = useQuery({
  goals: {
    todos: {}
  },
});
```

`goals` would now include nested `todos`
```javascript
console.log(data);
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
const data = {goals: doSQL(query)};
```

Notice how this SQL query is much more complex than previous examples. Although fetching associations in SQL is straightforward via `JOIN`, marshalling the results in a nested structure via SQL is tricky. An alternative approach would be to write two straight-forward queries and then marshall the data on the client.

```javascript
const _goals = doSQL("SELECT * from goals");
const _todos = doSQL("SELECT * from todos");
const data = {goals: _goals.map(g => (
  return {...g, todos: _todos.filter(t => t.goal_id === g.id)}
));
```

Now compare these two approaches with `InstaQL`
```javascript
const data = useQuery({
  goals: {
    todos: {}
  },
});
```

Modern applications often need to render nested relations, `InstaQL` really starts to shine for these use cases.
