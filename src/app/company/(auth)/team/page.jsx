'use client';

import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash,
  X,
  AlertTriangle,
  UserCircle,
  CheckCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext"; // Custom auth context
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useSubscription } from "@/context/SubscriptionContext";



const CompanyManageUsers = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_no: '',
    status: 'active',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { teams } = useSubscription();

  // Get session from NextAuth
  const { data: session, status } = useSession();
  // Get additional auth info from our custom context
  const { user, token: authToken, isAuthenticated } = useAuth();
  const router = useRouter();

  // For debugging
  console.log('NextAuth Session:', session);
  console.log('Custom Auth Context:', { user, authToken, isAuthenticated });

  // Extract company_id from session or user context
  const company_id = session?.user?.companyId || user?.company_id;

  // Get token from either NextAuth session or localStorage (for backward compatibility)
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (status === 'loading') return;

    // Check if we have a token from any source
    const hasToken = !!getAuthToken();
    console.log('Has auth token:', hasToken);

    // If NextAuth session is not authenticated but we have a token in localStorage,
    // we should still proceed (for backward compatibility)
    if (status === 'unauthenticated' && !hasToken) {
      console.log('No authentication found, redirecting to login');
      router.push('/login?callbackUrl=/company/team');
      return;
    }

    // Try to get company_id from localStorage if not in session
    let companyIdentifier = company_id;
    if (!companyIdentifier) {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          companyIdentifier = userData.company_id;
          console.log('Found company_id in localStorage:', companyIdentifier);
        }
      } catch (e) {
        console.error('Error parsing userData from localStorage:', e);
      }
    }

    // Fetch team members if we have authentication and company_id
    if ((status === 'authenticated' || hasToken) && companyIdentifier) {
      console.log('Authenticated with company ID, fetching team members');
      fetchTeamMembers(companyIdentifier);
    } else {
      console.log('Missing requirements for fetching team members:',
        { authenticated: status === 'authenticated' || hasToken, companyId: companyIdentifier });
    }
  }, [status, company_id, router]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const result = data.filter(user => {
        const name = user.name || '';
        const email = user.email || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredData(result);
    }
  }, [searchQuery, data]);

  const fetchTeamMembers = async (companyIdentifier = null) => {
    // Use provided company ID or fall back to the state variable
    const companyId = companyIdentifier || company_id;

    if (!companyId) {
      console.error('No company ID available for fetching team members');
      setError('Company ID not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get the token with our helper function
      const accessToken = getAuthToken();

      console.log('Fetching team members with token:', accessToken);
      console.log('Company ID:', company_id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/team/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ company_id: companyId })
      });

      // Log the raw response for debugging
      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response Data:', result);

      if (result.code !== 200) {
        throw new Error(result.msg || 'Failed to fetch team members');
      }

      const teamMembers = result.team_members || [];
      setData(teamMembers);
      setFilteredData(teamMembers);
    } catch (err) {
      console.error('Error fetching team members:', err.message);
      setError('Failed to load team members. Please try again.');
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserClick = () => {
    if (teams <= data.length) {
      alert(`You can only create a maximum of ${teams} teams.`);
      return;
    }
    setEditMode(false);
    setFormData({
      name: '',
      email: '',
      mobile_no: '',
      status: 'active',
      role: ''
    });
    setShowDialog(true);
  };

  const handleEditUserClick = (user) => {
    setEditMode(true);
    setEditTeamId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      mobile_no: user.mobile_no,
      status: user.status,
      role: user.role
    });
    setShowDialog(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = editMode ?
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/team/edit` :
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/team/add`;

      const payload = editMode ?
        { ...formData, team_id: editTeamId } :
        { ...formData, company_id };

      // Get the token with our helper function
      const accessToken = getAuthToken();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.msg || `Failed to ${editMode ? 'update' : 'add'} team member`);
      }

      setShowDialog(false);
      fetchTeamMembers();
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} team member:`, err.message);
      setError(`Failed to ${editMode ? 'update' : 'add'} team member. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (team_id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setIsLoading(true);

      try {
        // Get the token with our helper function
        const accessToken = getAuthToken();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/team/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ team_id }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.code !== 200) {
          throw new Error(result.msg || 'Failed to delete team member');
        }

        fetchTeamMembers();
      } catch (err) {
        console.error('Error deleting team member:', err.message);
        setError('Failed to delete team member. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // UI part
  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="border-b border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Team Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage your company team members and their roles
              </p>
            </div>
            <Button
              onClick={handleAddUserClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Loading and Error States */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading team members...</p>
            </div>
          )}

          {error && (
            <Alert className="mb-6 bg-red-50 border border-red-100 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Stats */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10 w-full md:w-96 border border-gray-200 rounded-md"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Alert className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="font-medium">Team Size: </span>
                  <span className="text-gray-600">
                    {data.length} of {teams}
                  </span>
                </div>
              </div>
            </Alert>
          </div>

          {/* Team Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((user, index) => (
                  <tr
                    key={user._id || index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.mobile_no}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs ${user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                        ) : null}
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEditUserClick(user)}
                          className="p-2 text-yellow-600 hover:text-yellow-700"
                          variant="ghost"
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:text-red-700"
                          variant="ghost"
                          disabled={isLoading}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editMode ? 'Edit User' : 'Add New User'}
              </h2>

              {error && (
                <Alert className="mb-4 bg-red-50 border border-red-100 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Number</label>
                  <Input
                    type="text"
                    value={formData.mobile_no}
                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    className="w-full border border-gray-200 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-md p-2"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-md p-2"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="team">Team</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      editMode ? 'Save Changes' : 'Add User'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManageUsers;