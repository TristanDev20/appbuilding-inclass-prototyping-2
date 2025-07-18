import React from 'react';

const UserContext = React.createContext();
export default UserContext;

export const UserProvider = UserContext.Provider;

