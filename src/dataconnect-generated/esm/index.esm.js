import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'v4',
  location: 'us-east4'
};

export const listAllMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMovies');
}
listAllMoviesRef.operationName = 'ListAllMovies';

export function listAllMovies(dc) {
  return executeQuery(listAllMoviesRef(dc));
}

export const getUserListsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserLists', inputVars);
}
getUserListsRef.operationName = 'GetUserLists';

export function getUserLists(dcOrVars, vars) {
  return executeQuery(getUserListsRef(dcOrVars, vars));
}

export const createMovieListItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMovieListItem', inputVars);
}
createMovieListItemRef.operationName = 'CreateMovieListItem';

export function createMovieListItem(dcOrVars, vars) {
  return executeMutation(createMovieListItemRef(dcOrVars, vars));
}

export const updateUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserProfile', inputVars);
}
updateUserProfileRef.operationName = 'UpdateUserProfile';

export function updateUserProfile(dcOrVars, vars) {
  return executeMutation(updateUserProfileRef(dcOrVars, vars));
}

