import { ListAllMoviesData, GetUserListsData, GetUserListsVariables, CreateMovieListItemData, CreateMovieListItemVariables, UpdateUserProfileData, UpdateUserProfileVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllMovies(options?: useDataConnectQueryOptions<ListAllMoviesData>): UseDataConnectQueryResult<ListAllMoviesData, undefined>;
export function useListAllMovies(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllMoviesData>): UseDataConnectQueryResult<ListAllMoviesData, undefined>;

export function useGetUserLists(vars: GetUserListsVariables, options?: useDataConnectQueryOptions<GetUserListsData>): UseDataConnectQueryResult<GetUserListsData, GetUserListsVariables>;
export function useGetUserLists(dc: DataConnect, vars: GetUserListsVariables, options?: useDataConnectQueryOptions<GetUserListsData>): UseDataConnectQueryResult<GetUserListsData, GetUserListsVariables>;

export function useCreateMovieListItem(options?: useDataConnectMutationOptions<CreateMovieListItemData, FirebaseError, CreateMovieListItemVariables>): UseDataConnectMutationResult<CreateMovieListItemData, CreateMovieListItemVariables>;
export function useCreateMovieListItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateMovieListItemData, FirebaseError, CreateMovieListItemVariables>): UseDataConnectMutationResult<CreateMovieListItemData, CreateMovieListItemVariables>;

export function useUpdateUserProfile(options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;
export function useUpdateUserProfile(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;
