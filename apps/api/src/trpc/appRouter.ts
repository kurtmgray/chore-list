import { router } from './index';

// Import routers
import { workspaceRouter } from '../routers/workspace';
import { userRouter } from '../routers/user';
import { categoryRouter } from '../routers/category';
import { choreRouter } from '../routers/chore';
import { frequencyTypeRouter } from '../routers/frequencyType';
import { completionRouter } from '../routers/completion';

// Main app router
export const appRouter = router({
  // Workspace management
  workspaces: workspaceRouter,
  
  // User management
  users: userRouter,
  
  // Core business entities
  categories: categoryRouter,
  chores: choreRouter,
  completions: completionRouter,
  
  // Lookup data
  frequencyTypes: frequencyTypeRouter,
});

export type AppRouter = typeof appRouter;