// API/src/API/Middleware/AuthChecker.ts
import { AuthChecker } from 'type-graphql';
import { Context } from '../Context';

export const authChecker: AuthChecker<Context> = ({ root, args, context: { user }, info }, roles): boolean => {
  // If no roles are being requested then just check the user is logged in.
  if (roles.length === 0) return user !== undefined;

  // If no user then no role to check.
  if (!user) return false;
  // Check if user roles include roles.
  if (user.role.some(role => roles.includes(role))) return true;

  // no roles matched, restrict access
  return false;
};
