import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateMovieListItemData {
  listItem_insert: ListItem_Key;
}

export interface CreateMovieListItemVariables {
  listId: UUIDString;
  movieId: UUIDString;
  position: number;
  note?: string | null;
}

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

export interface GetUserListsVariables {
  userId: UUIDString;
}

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

export interface ListItem_Key {
  listId: UUIDString;
  movieId: UUIDString;
  __typename?: 'ListItem_Key';
}

export interface List_Key {
  id: UUIDString;
  __typename?: 'List_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}

export interface UpdateUserProfileVariables {
  userId: UUIDString;
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Watch_Key {
  id: UUIDString;
  __typename?: 'Watch_Key';
}

interface ListAllMoviesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllMoviesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllMoviesData, undefined>;
  operationName: string;
}
export const listAllMoviesRef: ListAllMoviesRef;

export function listAllMovies(): QueryPromise<ListAllMoviesData, undefined>;
export function listAllMovies(dc: DataConnect): QueryPromise<ListAllMoviesData, undefined>;

interface GetUserListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserListsVariables): QueryRef<GetUserListsData, GetUserListsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserListsVariables): QueryRef<GetUserListsData, GetUserListsVariables>;
  operationName: string;
}
export const getUserListsRef: GetUserListsRef;

export function getUserLists(vars: GetUserListsVariables): QueryPromise<GetUserListsData, GetUserListsVariables>;
export function getUserLists(dc: DataConnect, vars: GetUserListsVariables): QueryPromise<GetUserListsData, GetUserListsVariables>;

interface CreateMovieListItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMovieListItemVariables): MutationRef<CreateMovieListItemData, CreateMovieListItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMovieListItemVariables): MutationRef<CreateMovieListItemData, CreateMovieListItemVariables>;
  operationName: string;
}
export const createMovieListItemRef: CreateMovieListItemRef;

export function createMovieListItem(vars: CreateMovieListItemVariables): MutationPromise<CreateMovieListItemData, CreateMovieListItemVariables>;
export function createMovieListItem(dc: DataConnect, vars: CreateMovieListItemVariables): MutationPromise<CreateMovieListItemData, CreateMovieListItemVariables>;

interface UpdateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  operationName: string;
}
export const updateUserProfileRef: UpdateUserProfileRef;

export function updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;
export function updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

