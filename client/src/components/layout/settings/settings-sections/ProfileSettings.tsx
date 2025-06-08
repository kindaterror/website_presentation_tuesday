import { useState, useEffect } from "react";
import { User, Upload, Save, Loader, CheckCircle, AlertCircle } from "lucide-react";

type ProfileSettingsProps = {
  userRole: "admin" | "teacher" | "student";
  user: any;
}

export function ProfileSettings({ userRole, user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // ✅ Avatar upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success && data.profile) {
        const nameParts = data.profile.name ? data.profile.name.split(' ') : ['', ''];
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: data.profile.email || '',
          bio: data.profile.bio || ''
        });
        // ✅ FIXED: Load avatar from database
        setAvatarUrl(data.profile.avatar);
        console.log('📸 Loaded avatar URL:', data.profile.avatar);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ✅ File upload handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setSaveStatus('error');
        setErrorMessage('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setSaveStatus('error');
        setErrorMessage('File size must be less than 2MB');
        return;
      }
      
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  // ✅ Upload function
  const handleUpload = async (file: File) => {
    setUploading(true);
    setSaveStatus('idle');
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSaveStatus('success');
        setAvatarUrl(result.avatarUrl);
        console.log('✅ Avatar uploaded successfully:', result.avatarUrl);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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

  const handleSave = async () => {
  setIsLoading(true);
  setSaveStatus('idle');
  setErrorMessage('');

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        bio: formData.bio,
        avatar: avatarUrl  
      })
    });

    const data = await response.json();

    if (data.success) {
      setSaveStatus('success');
      console.log('Profile saved successfully:', data);
    } else {
      setSaveStatus('error');
      setErrorMessage(data.message || 'Failed to save profile');
    }
  } catch (error) {
    setSaveStatus('error');
    setErrorMessage('Network error. Please check your connection.');
    console.error('Save profile error:', error);
  } finally {
    setIsLoading(false);
  }
};

  if (isLoadingProfile) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-ilaw-navy mr-2" />
        <span className="text-ilaw-navy">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 mr-3 text-ilaw-navy" />
        <h2 className="text-xl font-semibold text-ilaw-navy">Profile Settings</h2>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">
            {uploading ? 'Avatar uploaded successfully!' : 'Profile updated successfully!'}
          </span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* ✅ IMPROVED: Profile Picture Section with better avatar display */}
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-brand-gold-100 rounded-full flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
                onLoad={() => console.log('✅ Avatar loaded successfully:', avatarUrl)}
                onError={(e) => {
                  console.log('❌ Avatar load error:', avatarUrl);
                  setAvatarUrl(null); // Fallback to default if image fails
                }}
              />
            ) : (
              <User className="w-10 h-10 text-ilaw-navy" />
            )}
          </div>
          <div>
            {/* ✅ Hidden file input */}
            <input
              type="file"
              id="avatar-upload"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${styles.button} ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </label>
            <p className="text-sm text-ilaw-gray mt-2">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ilaw-navy mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-2 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ilaw-navy mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-2 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ilaw-navy mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-2 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50`}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ilaw-navy mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border ${styles.border} rounded-lg focus:outline-none focus:ring-2 ${styles.focus} focus:ring-opacity-50 resize-none`}
            placeholder="Tell us about yourself..."
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isLoading || uploading}
          className={`px-6 py-3 rounded-lg ${styles.button} flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfileSettings;