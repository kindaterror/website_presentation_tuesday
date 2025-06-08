import { useState } from "react";
import { Lock, Save, Shield, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from "lucide-react";

type SecuritySettingsProps = {
  userRole: "admin" | "teacher" | "student";
  user: any;
}

export function SecuritySettings({ userRole, user }: SecuritySettingsProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // == Role-based styling ==
  const getRoleStyles = () => {
    switch (userRole) {
      case "admin":
        return {
          button: "bg-ilaw-gold hover:bg-brand-gold-600 text-white",
          border: "border-brand-gold-200",
          focus: "focus:ring-ilaw-gold"
        };
      case "teacher":
        return {
          button: "bg-brand-navy hover:bg-brand-navy-600 text-white",
          border: "border-brand-navy-200",
          focus: "focus:ring-brand-navy"
        };
      case "student":
        return {
          button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg",
          border: "border-amber-300",
          focus: "focus:ring-amber-400"
        };
      default:
        return {
          button: "bg-ilaw-navy hover:bg-ilaw-navy-600 text-white",
          border: "border-gray-200",
          focus: "focus:ring-ilaw-navy"
        };
    }
  };

  const styles = getRoleStyles();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
      requirements: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous status when user starts typing
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
      setErrorMessage('');
    }
  };

  const handlePasswordUpdate = async () => {
    // Client-side validation
    if (!formData.currentPassword) {
      setSaveStatus('error');
      setErrorMessage('Current password is required');
      return;
    }

    if (!formData.newPassword) {
      setSaveStatus('error');
      setErrorMessage('New password is required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setSaveStatus('error');
      setErrorMessage('New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setSaveStatus('error');
      setErrorMessage('New password does not meet security requirements');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setSaveStatus('error');
      setErrorMessage('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth implementation
      
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus('success');
        // Clear form after successful update
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        console.log('Password updated successfully');
      } else {
        setSaveStatus('error');
        setErrorMessage(data.message || 'Failed to update password');
      }
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Network error. Please check your connection.');
      console.error('Update password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordValidation = validatePassword(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Lock className="w-6 h-6 mr-3 text-ilaw-navy" />
        <h2 className="text-xl font-semibold text-ilaw-navy">Password & Security</h2>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">Password updated successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-ilaw-navy mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className={`w-full px-4 py-2 pr-12 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ilaw-gray hover:text-ilaw-navy"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-ilaw-navy mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-4 py-2 pr-12 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ilaw-gray hover:text-ilaw-navy"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-ilaw-navy mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-2 pr-12 border ${formData.confirmPassword && !passwordsMatch ? 'border-red-300' : styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ilaw-gray hover:text-ilaw-navy"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Password Strength</h3>
            <div className="space-y-1">
              <div className={`flex items-center text-sm ${passwordValidation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.requirements.minLength ? 'bg-green-600' : 'bg-red-600'}`}></div>
                At least 8 characters
              </div>
              <div className={`flex items-center text-sm ${passwordValidation.requirements.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.requirements.hasUpper ? 'bg-green-600' : 'bg-red-600'}`}></div>
                Uppercase letter
              </div>
              <div className={`flex items-center text-sm ${passwordValidation.requirements.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.requirements.hasLower ? 'bg-green-600' : 'bg-red-600'}`}></div>
                Lowercase letter
              </div>
              <div className={`flex items-center text-sm ${passwordValidation.requirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.requirements.hasNumber ? 'bg-green-600' : 'bg-red-600'}`}></div>
                Number
              </div>
              <div className={`flex items-center text-sm ${passwordValidation.requirements.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.requirements.hasSpecial ? 'bg-green-600' : 'bg-red-600'}`}></div>
                Special character
              </div>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Security Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use a unique password for this account</li>
                <li>• Consider using a password manager</li>
                <li>• Change your password regularly</li>
                <li>• Never share your password with others</li>
              </ul>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePasswordUpdate}
          disabled={isLoading || !passwordValidation.isValid || !passwordsMatch || !formData.currentPassword}
          className={`px-6 py-3 rounded-lg ${styles.button} flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;