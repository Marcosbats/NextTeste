import React, { createContext, useContext, useState } from 'react';

interface ContextProps {
  id: string,
  setId: (newId: string) => void, // Defina o tipo da função setId
}

export const AuthContext = createContext<ContextProps>({
  id: '',
  setId: () => {} // Fornecer uma função vazia como um valor padrão
});

export function AuthProvider({ children }: any) {
  const [id, setId] = useState('');

  console.log('Valor de id no AuthContext:', id);
 
  return (
    <AuthContext.Provider value={{ id, setId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);