---
title: Presence and topics
---

## Rooms

The tl;dr -

- Users can join rooms to publish presence and broadcast topics.
- Each user can publish a presence object that is avaulable to all peers in a room and persists throught their session.
- Users can broadcast messages to a room. Messages are grouped into topics. Rooms can have multiple topics.

## Setup

Both presence and topics require no setup beyond calling `init`, however you may provide typings as a generic parameter.

```typescript
const db = init<
  // DB schema
  {
    // ...
  },
  // Presence shape
  { name: string; avatarUrl: string; color: string },
  // Topic types
  {
    emote: { emoji: string }
  }
>({
  appId,
})
```

## Presence

```javascript
const { user, peers, publishPresence } = db.usePresence('example-room')

useEffect(() => {
  publishPresence({ name: 'joe' })
}, [])
```

## Topics

```javascript
const publishEmote = db.usePublishTopic('example-room', 'emotes')

db.useTopicEffect('example-room', 'emote', (event, peer) => {
  // ...
})
```

## Turnkey helpers for React apps

### Cursors

```javascript
<Cursors
  db={db}
  roomId="example-room"
  spaceId="space-1"
  className="cursors"
  currentUserColor
/>
```

You can render multiple cursor spaces. For instance, imagine you're building a screen with multiple tabs. You probably don't want to show peer's cursors unless they're viwing the same tab as the current user, so you can provide each `<Cursors />` element with their own `spaceId`.

```javascript
<Tabs>
  {tabs.map((tab) => (
    <Tab>
      <Cursors
        db={db}
        roomId="example-room"
        spaceId={`tab-${tab.id}`}
        className="tab-cursor"
      >
        {/* ... */}
      </Cursors>
    </Tab>
  ))}
</Tabs>
```

You can even nest `<Cursors />`!

```javascript
<Cursors
  db={db}
  roomId="example-room"
  spaceId="space-outer"
  userCursorColor="magenta"
  className="cursors-nested-outer"
>
  <Cursors
    db={db}
    roomId="example-room"
    spaceId="space-inner"
    userCursorColor="blue"
    className="cursors-nested-inner"
  />
</Cursors>
```

### Typing indicators

```javascript
const { active, inputProps } = db.useTypingIndicator(
  'example-room',
  'chat-input'
)

return (
  <div>
    <input {...inputProps} />
    {Object.keys(active).length ? <span>Peer is typing...</span> : null}
  </div>
)
```
