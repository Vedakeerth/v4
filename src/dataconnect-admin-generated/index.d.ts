import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'ListAllMovies' Query. Allow users to execute without passing in DataConnect. */
export function listAllMovies(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllMoviesData>>;
/** Generated Node Admin SDK operation action function for the 'ListAllMovies' Query. Allow users to pass in custom DataConnect instances. */
export function listAllMovies(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllMoviesData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserLists' Query. Allow users to execute without passing in DataConnect. */
export function getUserLists(dc: DataConnect, vars: GetUserListsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserListsData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserLists' Query. Allow users to pass in custom DataConnect instances. */
export function getUserLists(vars: GetUserListsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserListsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateMovieListItem' Mutation. Allow users to execute without passing in DataConnect. */
export function createMovieListItem(dc: DataConnect, vars: CreateMovieListItemVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateMovieListItemData>>;
/** Generated Node Admin SDK operation action function for the 'CreateMovieListItem' Mutation. Allow users to pass in custom DataConnect instances. */
export function createMovieListItem(vars: CreateMovieListItemVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateMovieListItemData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUserProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserProfileData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUserProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUserProfile(vars: UpdateUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserProfileData>>;

