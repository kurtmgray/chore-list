import { trpc } from '../lib/trpc';
import { PageTransition, FadeInUp } from '../components/PageTransition';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Settings() {
  const { data: users, isLoading: usersLoading } = trpc.users.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.getAll.useQuery();
  const { data: frequencyTypes, isLoading: frequencyTypesLoading } = trpc.frequencyTypes.getAll.useQuery();

  const isLoading = usersLoading || categoriesLoading || frequencyTypesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <FadeInUp delay={0}>
          <div>
            <h1 
              className="text-2xl lg:text-3xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--neutral-900)' }}
            >
              Settings
            </h1>
            <p 
              className="text-sm lg:text-base"
              style={{ color: 'var(--neutral-600)' }}
            >
              Manage your household, categories, and preferences
            </p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Household Members */}
          <FadeInUp delay={100}>
            <Card variant="elevated" hover className="h-fit">
              <CardHeader>
                <h3 
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  <span className="text-xl">👥</span>
                  Household Members
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 mb-4">
                  {users?.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--gradient-elevated)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{user.avatar}</span>
                        <div>
                          <p 
                            className="font-medium"
                            style={{ color: 'var(--neutral-900)' }}
                          >
                            {user.first_name} {user.last_name}
                          </p>
                          {user.email && (
                            <p 
                              className="text-sm"
                              style={{ color: 'var(--neutral-600)' }}
                            >
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full">
                  <span className="mr-2">+</span>
                  Add Member
                </Button>
              </CardBody>
            </Card>
          </FadeInUp>

          {/* Categories */}
          <FadeInUp delay={150}>
            <Card variant="elevated" hover className="h-fit">
              <CardHeader>
                <h3 
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  <span className="text-xl">🏷️</span>
                  Categories
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 mb-4">
                  {categories?.slice(0, 6).map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{ background: 'var(--gradient-elevated)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span 
                          className="font-medium text-sm"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {category.name}
                        </span>
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  {categories && categories.length > 6 && (
                    <p 
                      className="text-xs text-center py-2"
                      style={{ color: 'var(--neutral-500)' }}
                    >
                      +{categories.length - 6} more categories
                    </p>
                  )}
                </div>
                <Button variant="secondary" className="w-full">
                  <span className="mr-2">+</span>
                  Add Category
                </Button>
              </CardBody>
            </Card>
          </FadeInUp>

          {/* Frequency Types */}
          <FadeInUp delay={200}>
            <Card variant="elevated" hover className="h-fit">
              <CardHeader>
                <h3 
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  <span className="text-xl">⏰</span>
                  Frequency Types
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 mb-4">
                  {frequencyTypes?.slice(0, 5).map((freq) => (
                    <div 
                      key={freq.id}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{ background: 'var(--gradient-elevated)' }}
                    >
                      <div>
                        <p 
                          className="font-medium text-sm"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {freq.name}
                        </p>
                        {freq.description && (
                          <p 
                            className="text-xs"
                            style={{ color: 'var(--neutral-600)' }}
                          >
                            {freq.description}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full">
                  <span className="mr-2">+</span>
                  Add Frequency
                </Button>
              </CardBody>
            </Card>
          </FadeInUp>

          {/* Workspace Settings */}
          <FadeInUp delay={250}>
            <Card variant="elevated" hover className="h-fit">
              <CardHeader>
                <h3 
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  <span className="text-xl">🏠</span>
                  Workspace Settings
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--neutral-700)' }}
                    >
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Kurt & Kaya's Household"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--neutral-200)',
                        color: 'var(--neutral-900)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--neutral-700)' }}
                    >
                      Timezone
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--neutral-200)',
                        color: 'var(--neutral-900)'
                      }}
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  
                  <Button variant="primary" className="w-full">
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}