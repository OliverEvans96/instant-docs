---
title: Permissions
---

To secure user data, you can use Instant’s Rule Language. Our rule language
takes inspiration from Rails’ Activerecord, Google’s CEL, and JSON.
Here’s an example rulset below

```json
{
  "todos": {
    "allow": {
      "view": "auth.id != null",
      "create": "auth.id == newData.creatorId",
      "update": "isOwner",
      "delete": "isOwner"
    },
    "bind": ["isOwner", "auth.id == data.creatorId"]
  }
}
```

## Rules Editor

For each app in your dashboard, you’ll see a rules editor. Rules are expressed
as JSON. Each top level key represents one of your namespaces — for example
`goals`, `todos`, and the like. There is also a special top-level key "attrs" for
defining permissions on creating new types of namespaces and attributes.

## Namespaces

For each namespace you can define `allow` rules for `view`, `create`, `update`, `delete`. Rules
must be boolean expressions.

If a rule is not set then by default it evaluates to true. The following three
rulesets are all equivalent

In this example we explicitly set each action for `todos` to true

```json
"todos": {
  "allow": {
    "view": "true",
    "create": "true",
    "update": "true",
    "delete": "true"
  },
```

In this example we explicitly set `view` to be true. However, all the remaining
actions for `todo` also default to true.

```json
"todos": {
  "allow": {
    "view": "true"
  },
```

In this example we set no rules, and thus all permission checks pass.

```json
{}
```

{% callout type="warning" %}

When you start developing you probably need to worry about
permissions. However, once you start shipping your app to users you will
want to secure their data!

{% /callout %}

### View

`view` rules are evaluated when doing `useQuery`. On the backend every object
that satisfies a query will run through the `view` rule before being passed back
to the client. This means as a developer you can ensure that no matter what query
a user executes, they’ll _only_ see data that they are allowed to see.

### Create, Update, Delete

Similarly, for each object in a transaction, we make sure to evaluate the respective `create`, `update`, and `delete` rule.
Transactions will fail if a user does not have adequate permission.

## Attrs

Attrs are a special kind of namespace for creating new types of data on the fly.
Currently we only support creating attrs. During development you likely don't
need to lock this rule down, but once you ship you will likely want to set this
permission to `false`

Suppose our data model looks like this

```json
{
  "goals": { "id": UUID, "title": string }
}
```

And we have a rules defined as

```json
{
  "attrs": { "allow": { "create": "false" } }
}
```

Then we could create goals with existing attr types:

```javascript
transact(tx.goals[id()).update({title: "Hello World"})
```

But we would not be able to create goals with new attr types:

```javascript
transact(tx.goals[id()).update({title: "Hello World", priority: "high"})
```

## CEL expressions

Inside each rule, you can write CEL code that evaluates to either `true` or `false`.

```json
{
  "attrs": { "allow": { "create": "false" } },
  "todos": {
    "allow": {
      "view": "auth.id != null",
      "create": "newData.creatorId == auth.id",
      "update": "!(newData.title == data.title)",
      "delete": "'joe@instantdb.com' in data.ref('users.email')"
    }
  }
}
```

The above example shows a taste of the kind of rules you can write :)

### data

`data` refers to existing data. This will be populated when used for `view`, `update`, and `delete` rules

### newData

`newData` refers to new data from a transaction. This will be populated when
used for `create` and `update` rules.

### bind

`bind` allows you to alias logic. The following are equivalent

```json
{
  "attrs": { "allow": { "create": "false" } },
  "todos": {
    "allow": {
      "create": "isOwner"
    },
    "bind": ["isOwner", "auth.id == data.creatorId"]
  }
}
```

```json
{
  "attrs": { "allow": { "create": "false" } },
  "todos": {
    "allow": {
      "create": "auth.id == data.creatorId"
    }
  }
}
```

`bind` is useful for not repeating yourself and tidying up rules

```json
{
  "attrs": { "allow": { "create": "false" } },
  "todos": {
    "allow": {
      "create": "isOwner || isAdmin"
    },
    "bind": [
      "isOwner",
      "auth.id == data.creatorId",
      "isAdmin",
      "auth.email in ['joe@instantdb.com', 'stopa@instantdb.com']"
    ]
  }
}
```

### ref

You can also refer to relations in your permission checks. This rule restricts
delete to only succeed on todos associated with a specific user email.

```json
{
  "attrs": { "allow": { "create": "false" } },
  "todos": {
    "allow": {
      "delete": "'joe@instantdb.com' in data.ref('users.email')"
    },
    "bind": [
      "isOwner",
      "auth.id == data.creatorId",
      "isAdmin",
      "auth.email in ['joe@instantdb.com', 'stopa@instantdb.com']"
    ]
  }
}
```

## Get Help

We heavily leverage CEL for our permission language. Let us know if you have any questions!
We're happy help and provide more examples :)
