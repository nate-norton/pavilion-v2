import { createContext, useContext, type ReactNode } from 'react';
import type { Repository } from './Repository';
import { MockRepository } from './MockRepository';

/** Default keeps tests and stray renders working without an explicit provider. */
const RepositoryContext = createContext<Repository>(new MockRepository());

export function RepositoryProvider({ repository, children }: { repository: Repository; children: ReactNode }) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export const useRepository = (): Repository => useContext(RepositoryContext);
