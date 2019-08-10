// UI/UI/Components/Router/types.tsx
import { LoadableType } from './Loadable';
import { UserRole } from '../Providers/SessionProvider';

export interface AppRoute {
  /**
   * Route Path for Router Route Component
   */
  path: string;

  /**
   * The full path used for navigation, Links, etc...
   */
  to: string;

  /**
   * Public label for route
   */
  label: string;

  /**
   * Auth Mode
   * True means user must be logged in and will be redirected to login if logged out
   * False means user must be logged out and will be redirected to `/` if logged in
   * Undefined means user can be logged in or out
   */
  authMode?: boolean;

  /**
   * Required Role
   */
  role?: UserRole;

  /**
   * Hide UI. Wether the AppBar and NavBar are hidden on this route
   */
  hideUI?: boolean;

  /**
   * Exact
   */
  exact?: boolean;

  /**
   * Hidden from Lists
   */
  hidden?: boolean;

  children?: AppRoute[];

  Loadable?: LoadableType<any>;
}
