import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{user?.id}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign out of your account
        </p>
        <Button variant="secondary" onClick={signOut}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
