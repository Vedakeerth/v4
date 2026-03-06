const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'v4',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMovies');
}
listAllMoviesRef.operationName = 'ListAllMovies';
exports.listAllMoviesRef = listAllMoviesRef;

exports.listAllMovies = function listAllMovies(dc) {
  return executeQuery(listAllMoviesRef(dc));
};

const getUserListsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserLists', inputVars);
}
getUserListsRef.operationName = 'GetUserLists';
exports.getUserListsRef = getUserListsRef;

exports.getUserLists = function getUserLists(dcOrVars, vars) {
  return executeQuery(getUserListsRef(dcOrVars, vars));
};

const createMovieListItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMovieListItem', inputVars);
}
createMovieListItemRef.operationName = 'CreateMovieListItem';
exports.createMovieListItemRef = createMovieListItemRef;

exports.createMovieListItem = function createMovieListItem(dcOrVars, vars) {
  return executeMutation(createMovieListItemRef(dcOrVars, vars));
};

const updateUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserProfile', inputVars);
}
updateUserProfileRef.operationName = 'UpdateUserProfile';
exports.updateUserProfileRef = updateUserProfileRef;

exports.updateUserProfile = function updateUserProfile(dcOrVars, vars) {
  return executeMutation(updateUserProfileRef(dcOrVars, vars));
};
