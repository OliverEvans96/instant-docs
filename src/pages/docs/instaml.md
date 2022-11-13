---
title: InstaML
---

Instant uses a **Firebase-inspired** interface for mutations. We call our mutation language **InstaML**

## Why InstaML

We love Firebase's simple mutation API and how it provides optimistic updates and rollbacks for free. We wanted to bring the same experience with support for relations.

You can try out the examples below with {% sandbox-link type="goals-and-todos" label="this sandbox" /%}.

## Transact

`transact` is used for committing transaction chunks. `transact` takes only one parameter, an array of `tx` transaction chunks. For example running the following

```javascript
transact([
  tx.todos["workout"].update({title: "Go on a run"}),
  tx.todos["protein"].update({title: "Drink protein"}),
  tx.todos["sleep"].update({title: "Go to bed early"}),
  tx.todos["standup"].update({title: "Do standup"}),
  tx.todos["reviewPRs"].update({title: "Review PRs"}),
  tx.todos["focus"].update({title: "Code a bunch"}),
  tx.goals["health"].update({title: "Get fit!"})
    .link({ todos: "workout"})
    .link({ todos: "protein"})
    .link({ todos: "sleep"})
  tx.goals["work"].update({title: "Get promoted!"})
    .link({ todos: "standup"})
    .link({ todos: "reviewPRs"})
    .link({ todos: "focus"})
])
```

Will generate:

- todos, identified as `workout`, `protein`, `sleep`, `standup`, `reviewPRs`, and `focus`
- goals, identified as `health` and `work`
- todos `workout`, `protein`, and `sleep` are associated with goal `health`
- todos `standup`, `reviewPRs`, and `focus` are associated with goal `work`

## tx

`tx` is a [proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which creates transaction chunks to be commited via `transact`. It follows the format

```
tx.NAMESPACE_LABEL[GLOBAL_UNIQUE_IDENTIFER].ACTION(ACTION_SPECIFIC_DATA)
```

- `NAMESPACE_LABEL` refers to the namespace to commit (e.g. `goals`, `todos`)
- `GLOBAL_UNIQUE_IDENTIFER` is the id to look up in the namespace. This id must be unique across **all namespaces**. Suppose we have a namespace `authors`, and `editors`. If we have id `joe` in `authors`, we cannot have id `joe` in `editors` as well.
- `ACTION` is one of `update`, `delete`, `link`, `unlink`
- `ACTION_SPECIFIC_DATA` depends on the action
  - `update` takes in an object of information to commit
  - `delete` is the only aciton that doesn't take in any data,
  - `link` and `unlink` takes an object of label-entity pairs to create/delete associations

### Update

We use the `update` action to create entities.

```javascript
transact([tx.goals[id()].update({ title: 'eat' })])
```

This creates a new `goal` with the following properties:

- It's identified by a randomly generated id via the `id()` function.
- It has an attribute `title` with value `eat`.

Similar to NoSQL, you don't need to use the same schema for each entity in a namespace. After creating the previous goal you can run the following:

```javascript
transact([
  tx.goals[id()].update({
    priority: 'none',
    isSecret: true,
    value: 10,
    aList: [1, 2, 3],
    anObject: { foo: 'bar' },
  }),
])
```

You can store `strings`, `numbers,` `booleans`, `arrays`, and `objects` as values. You can also generate values via functions. Below is an example for picking a random goal title.

```javascript
transact([
  tx.goals[id()].update({
    title: ['eat', 'sleep', 'hack', 'repeat'][Math.floor(Math.random() * 4)],
  }),
])
```

---

The `update` action is also used for updating entities. Suppose we had created the following goal

```javascript
transact([
  tx.goals['eat'].update({ priority: 'top', lastTimeEaten: 'Yesterday' }),
])
```

We eat some food and decide to update the goal. We can do that like so:

```javascript
transact([tx.goals['eat'].update({ lastTimeEaten: 'Today' })])
```

This will only update the value of the `lastTimeEaten` attribute for entity `eat`.

{% callout %}
In the previous example we used `eat` as the identifer for illustrating how to update
an entity. In practice though you will likely want to generate unique and random string identifiers for your entities via the `id()` function.

This is because ids must be unique across all namespaces. In a real application, ids like `eat`, `joe` or `stopa` are unlikely to be unique and may result in unexpected behavior if the same identifier appears in more than one namespace.
{% /callout %}

### Delete

The `delete` action is used for deleting entities.

```javascript
transact([tx.goals['eat'].delete()])
```

You can generate an array of `delete` txs to delete all entities in a namespace

```javascript
const { goals } = useQuery({goals: {}}
...
transact(goals.map(g => tx.goals[g.id].delete()));
```

Calling `delete` on an entity also deletes its associations. So no need to worry about cleaning up previously created links.

### Link

`link` is used to create associations.

Suppose we create a `goal` and a `todo`.

```javascript
transact([
  tx.todos['workout'].update({ title: 'Go on a run' }),
  tx.goals['health'].update({ title: 'Get fit!' }),
])
```

We can associate `health` with `workout` like so:

```javascript
transact([tx.goals['health'].link({ todos: 'workout' })])
```

We could have done all this in one `transact` too via chaining transaction chunks.

```javascript
transact([
  tx.todos['workout'].update({ title: 'Go on a run' }),
  tx.goals['health'].update({ title: 'Get fit!' }).link({ todos: 'workout' }),
])
```

You can chain multiple `link`s in one `tx` too.

```javascript
transact([
  tx.todos['workout'].update({ title: 'Go on a run' }),
  tx.todos['protein'].update({ title: 'Drink protein' }),
  tx.todos['sleep'].update({ title: 'Go to bed early' }),
  tx.goals['health']
    .update({ title: 'Get fit!' })
    .link({ todos: 'workout' })
    .link({ todos: 'protein' })
    .link({ todos: 'sleep' }),
])
```

Order matters when creating links.

```javascript
transact([tx.goals['health'].link({ todos: 'workout' })])
```

This creates:

- A forward link from entity `health` to entity `workout` via `goals` -> `todos`
- A reverse link from entity `workout` to entity `health` via `todos` -> `_goals`

We can query associations in both directions via these links

```javascript
const { goals, todos } = useQuery({
  goals: { todos: {} },
  todos: { _goals: {} },
})
```

Link labels do not need to match the namespace of the right-side entity. We could have done this instead:

```javascript
transact([tx.goals['health'].link({ priorities: 'workout' })])
```

This creates:

- A forward link from entity `health` to entity `workout` via `goals` -> `priorities`
- A reverse link from entity `workout` to entity `health` via `todos` -> `_goals` through `priorities`

In this case the getting the forward associations is the same as before,but reverse association requires the `through` key.

```javascript
const { goals, todos } = useQuery({
  goals: { todos: {} },
  todos: { _goals: { $: { through: 'priorities' } } },
})
```

Using different link labels is useful for disambiguation. Consider the following:

```javascript
transact([
  tx.users['joe'].update({ name: 'Joe' }),
  tx.users['stopa'].update({ name: 'Stopa' }),
  tx.posts['essay']
    .update({ title: 'Graph Based Firebase' })
    .link({ author: 'stopa' })
    .link({ editor: 'joe' }),
])
```

Here we have:

- users, identified as `joe` and `stopa`
- A post, identified as `essay` which was authored by user `stopa` and edited by user `joe`.

Although `joe` and `stopa` are both entities in the `users` namespace, the context between `posts` and `users` is different for these associations. Being able to assign a different link label enables us to differentiate between authors, editors, authored posts, and edited posts at query time.

```javascript
const query = {
  "posts": {
    "author": {},
    "editor": {}
  }
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
})
```

### Unlink

Links can be removed via `unlink`

```javascript
transact([tx.goals['health'].unlink({ todos: 'workout' })])
```

This removes both:

- The forward link from entity `health` to entity `workout`
- The reverse link from entity `workout` to entity `health`

Similar to other actions, we can chain multiple `unlink` on a `tx`.

```javascript
transact([
  tx.goals['health']
    .unlink({ todos: 'workout' })
    .unlink({ todos: 'protein' })
    .unlink({ todos: 'sleep' }),
  tx.goals['work']
    .unlink({ todos: 'standup' })
    .unlink({ todos: 'reviewPRs' })
    .unlink({ todos: 'focus' }),
])
```

Although `unlink` will remove links in both directions, it only accepts the forward link as an input. So this works:

```javascript
transact([tx.goals['health'].unlink({ todos: 'workout' })])
```

But this does not

```javascript
transact([tx.todos['workout'].unlink({ _goals: 'health' })])
```
