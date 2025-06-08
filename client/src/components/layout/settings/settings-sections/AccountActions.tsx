import { useState } from "react";
import { Trash2, AlertTriangle, Download, LogOut } from "lucide-react";

type AccountActionsProps = {
  userRole: "admin" | "teacher" | "student";
  user: any;
}

export function AccountActions({ userRole, user }: AccountActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // == Role-based styling ==
  const getRoleStyles = () => {
    switch (userRole) {
      case "admin":
        return {
          button: "bg-ilaw-gold hover:bg-brand-gold-600 text-white",
          border: "border-brand-gold-200"
        };
      case "teacher":
        return {
          button: "bg-brand-navy hover:bg-brand-navy-600 text-white",
          border: "border-brand-navy-200"
        };
      case "student":
        return {
          button: "bg-brand-amber hover:bg-brand-amber-600 text-white",
          border: "border-brand-amber"
        };
      default:
        return {
          button: "bg-ilaw-navy hover:bg-ilaw-navy-600 text-white",
          border: "border-gray-200"
        };
    }
  };

  const styles = getRoleStyles();

  const handleExportData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('📤 Export data:', data);
    
    if (data.success) {
      alert('Data exported successfully! Check console for details.');
    }
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data');
  }
};

const handleLogoutAllDevices = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/logout-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('🚪 Logout all:', data);
    
    if (data.success) {
      alert('Logged out from all devices successfully!');
    }
  } catch (error) {
    console.error('Logout all error:', error);
    alert('Failed to logout from all devices');
  }
};

const handleDeleteAccount = async () => {
  if (deleteConfirmText === "DELETE") {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Account deleted successfully');
        
        // Clear all local data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to home/login page
        window.location.href = '/';
        
      } else {
        alert('Failed to delete account: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Delete account error:', error);
      alert('Network error. Please try again.');
    }
    
    setShowDeleteConfirm(false);
  }
};

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Trash2 className="w-6 h-6 mr-3 text-ilaw-navy" />
        <h2 className="text-xl font-semibold text-ilaw-navy">Account Actions</h2>
      </div>

      <div className="space-y-6">
        
        {/* Export Data Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Export Your Data</h3>
              <p className="text-sm text-blue-700 mb-4">
                Download a copy of all your account data including profile information, activity history, and preferences.
              </p>
              <button
                onClick={handleExportData}
                className={`px-4 py-2 rounded-lg ${styles.button} flex items-center`}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Logout All Devices */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Security Action</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Log out from all devices except this one. This will require you to sign in again on other devices.
              </p>
              <button
                onClick={handleLogoutAllDevices}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout All Devices
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
              <p className="text-sm text-red-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-red-700 mb-2">
                      Type <span className="font-bold">DELETE</span> to confirm account deletion:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      placeholder="Type DELETE to confirm"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE"}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        deleteConfirmText === "DELETE"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountActions;