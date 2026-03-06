# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllMovies*](#listallmovies)
  - [*GetUserLists*](#getuserlists)
- [**Mutations**](#mutations)
  - [*CreateMovieListItem*](#createmovielistitem)
  - [*UpdateUserProfile*](#updateuserprofile)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllMovies
You can execute the `ListAllMovies` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllMovies(): QueryPromise<ListAllMoviesData, undefined>;

interface ListAllMoviesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllMoviesData, undefined>;
}
export const listAllMoviesRef: ListAllMoviesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllMovies(dc: DataConnect): QueryPromise<ListAllMoviesData, undefined>;

interface ListAllMoviesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllMoviesData, undefined>;
}
export const listAllMoviesRef: ListAllMoviesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllMoviesRef:
```typescript
const name = listAllMoviesRef.operationName;
console.log(name);
```

### Variables
The `ListAllMovies` query has no variables.
### Return Type
Recall that executing the `ListAllMovies` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllMoviesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllMoviesData {
  movies: ({
    id: UUIDString;
    title: string;
    year: number;
    genres?: string[] | null;
    summary?: string | null;
    runtime?: number | null;
    createdAt: TimestampString;
  } & Movie_Key)[];
}
```
### Using `ListAllMovies`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllMovies } from '@dataconnect/generated';


// Call the `listAllMovies()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllMovies();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllMovies(dataConnect);

console.log(data.movies);

// Or, you can use the `Promise` API.
listAllMovies().then((response) => {
  const data = response.data;
  console.log(data.movies);
});
```

### Using `ListAllMovies`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllMoviesRef } from '@dataconnect/generated';


// Call the `listAllMoviesRef()` function to get a reference to the query.
const ref = listAllMoviesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllMoviesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.movies);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.movies);
});
```

## GetUserLists
You can execute the `GetUserLists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserLists(vars: GetUserListsVariables): QueryPromise<GetUserListsData, GetUserListsVariables>;

interface GetUserListsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserListsVariables): QueryRef<GetUserListsData, GetUserListsVariables>;
}
export const getUserListsRef: GetUserListsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserLists(dc: DataConnect, vars: GetUserListsVariables): QueryPromise<GetUserListsData, GetUserListsVariables>;

interface GetUserListsRef {
  ...
  (dc: DataConnect, vars: GetUserListsVariables): QueryRef<GetUserListsData, GetUserListsVariables>;
}
export const getUserListsRef: GetUserListsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserListsRef:
```typescript
const name = getUserListsRef.operationName;
console.log(name);
```

### Variables
The `GetUserLists` query requires an argument of type `GetUserListsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserListsVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserLists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserListsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserListsData {
  lists: ({
    id: UUIDString;
    name: string;
    isPublic: boolean;
    description?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & List_Key)[];
}
```
### Using `GetUserLists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserLists, GetUserListsVariables } from '@dataconnect/generated';

// The `GetUserLists` query requires an argument of type `GetUserListsVariables`:
const getUserListsVars: GetUserListsVariables = {
  userId: ..., 
};

// Call the `getUserLists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserLists(getUserListsVars);
// Variables can be defined inline as well.
const { data } = await getUserLists({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserLists(dataConnect, getUserListsVars);

console.log(data.lists);

// Or, you can use the `Promise` API.
getUserLists(getUserListsVars).then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

### Using `GetUserLists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserListsRef, GetUserListsVariables } from '@dataconnect/generated';

// The `GetUserLists` query requires an argument of type `GetUserListsVariables`:
const getUserListsVars: GetUserListsVariables = {
  userId: ..., 
};

// Call the `getUserListsRef()` function to get a reference to the query.
const ref = getUserListsRef(getUserListsVars);
// Variables can be defined inline as well.
const ref = getUserListsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserListsRef(dataConnect, getUserListsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateMovieListItem
You can execute the `CreateMovieListItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMovieListItem(vars: CreateMovieListItemVariables): MutationPromise<CreateMovieListItemData, CreateMovieListItemVariables>;

interface CreateMovieListItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMovieListItemVariables): MutationRef<CreateMovieListItemData, CreateMovieListItemVariables>;
}
export const createMovieListItemRef: CreateMovieListItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMovieListItem(dc: DataConnect, vars: CreateMovieListItemVariables): MutationPromise<CreateMovieListItemData, CreateMovieListItemVariables>;

interface CreateMovieListItemRef {
  ...
  (dc: DataConnect, vars: CreateMovieListItemVariables): MutationRef<CreateMovieListItemData, CreateMovieListItemVariables>;
}
export const createMovieListItemRef: CreateMovieListItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMovieListItemRef:
```typescript
const name = createMovieListItemRef.operationName;
console.log(name);
```

### Variables
The `CreateMovieListItem` mutation requires an argument of type `CreateMovieListItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMovieListItemVariables {
  listId: UUIDString;
  movieId: UUIDString;
  position: number;
  note?: string | null;
}
```
### Return Type
Recall that executing the `CreateMovieListItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMovieListItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMovieListItemData {
  listItem_insert: ListItem_Key;
}
```
### Using `CreateMovieListItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMovieListItem, CreateMovieListItemVariables } from '@dataconnect/generated';

// The `CreateMovieListItem` mutation requires an argument of type `CreateMovieListItemVariables`:
const createMovieListItemVars: CreateMovieListItemVariables = {
  listId: ..., 
  movieId: ..., 
  position: ..., 
  note: ..., // optional
};

// Call the `createMovieListItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMovieListItem(createMovieListItemVars);
// Variables can be defined inline as well.
const { data } = await createMovieListItem({ listId: ..., movieId: ..., position: ..., note: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMovieListItem(dataConnect, createMovieListItemVars);

console.log(data.listItem_insert);

// Or, you can use the `Promise` API.
createMovieListItem(createMovieListItemVars).then((response) => {
  const data = response.data;
  console.log(data.listItem_insert);
});
```

### Using `CreateMovieListItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMovieListItemRef, CreateMovieListItemVariables } from '@dataconnect/generated';

// The `CreateMovieListItem` mutation requires an argument of type `CreateMovieListItemVariables`:
const createMovieListItemVars: CreateMovieListItemVariables = {
  listId: ..., 
  movieId: ..., 
  position: ..., 
  note: ..., // optional
};

// Call the `createMovieListItemRef()` function to get a reference to the mutation.
const ref = createMovieListItemRef(createMovieListItemVars);
// Variables can be defined inline as well.
const ref = createMovieListItemRef({ listId: ..., movieId: ..., position: ..., note: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMovieListItemRef(dataConnect, createMovieListItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.listItem_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.listItem_insert);
});
```

## UpdateUserProfile
You can execute the `UpdateUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserProfileRef:
```typescript
const name = updateUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserProfileVariables {
  userId: UUIDString;
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
}
```
### Return Type
Recall that executing the `UpdateUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserProfile, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  userId: ..., 
  displayName: ..., // optional
  email: ..., // optional
  photoUrl: ..., // optional
};

// Call the `updateUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserProfile(updateUserProfileVars);
// Variables can be defined inline as well.
const { data } = await updateUserProfile({ userId: ..., displayName: ..., email: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserProfile(dataConnect, updateUserProfileVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserProfile(updateUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserProfileRef, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  userId: ..., 
  displayName: ..., // optional
  email: ..., // optional
  photoUrl: ..., // optional
};

// Call the `updateUserProfileRef()` function to get a reference to the mutation.
const ref = updateUserProfileRef(updateUserProfileVars);
// Variables can be defined inline as well.
const ref = updateUserProfileRef({ userId: ..., displayName: ..., email: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserProfileRef(dataConnect, updateUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

