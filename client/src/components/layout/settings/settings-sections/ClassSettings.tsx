import { useState, useEffect } from "react";
import { GraduationCap, Save, BookOpen, Loader, CheckCircle, AlertCircle, Users, Target } from "lucide-react";

type ClassSettingsProps = {
  userRole: "admin" | "teacher" | "student";
  user: any;
}

export function ClassSettings({ userRole, user }: ClassSettingsProps) {
  const [teacherSettings, setTeacherSettings] = useState({
    preferredGrades: ["Grade 5"],
    subjects: ["Filipino Literature"],
    maxClassSize: 30
    // ✅ REMOVED: teachingStyle: "interactive"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    loadTeachingSettings();
  }, []);

  const loadTeachingSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/user/teaching-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success && data.settings) {
        setTeacherSettings({
          preferredGrades: data.settings.preferredGrades || ["Grade 5"],
          subjects: data.settings.subjects || ["Filipino Literature"],
          maxClassSize: data.settings.maxClassSize || 30
          // ✅ REMOVED: teachingStyle: data.settings.teachingStyle || "interactive"
        });
      }
    } catch (error) {
      console.error('Failed to load teaching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const gradeOptions = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"
  ];

  const subjectOptions = [
    "Filipino Literature", 
    "Philippine Folklore", 
    "Reading Comprehension",
    "Creative Writing",
    "General Education"
  ];

  const handleSettingsChange = () => {
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
      setErrorMessage('');
    }
  };

  const handleGradeChange = (grade: string, checked: boolean) => {
    if (checked) {
      setTeacherSettings(prev => ({
        ...prev,
        preferredGrades: [...prev.preferredGrades, grade]
      }));
    } else {
      setTeacherSettings(prev => ({
        ...prev,
        preferredGrades: prev.preferredGrades.filter(g => g !== grade)
      }));
    }
    handleSettingsChange();
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setTeacherSettings(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    } else {
      setTeacherSettings(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== subject)
      }));
    }
    handleSettingsChange();
  };

  const handleClassSizeChange = (size: number) => {
    setTeacherSettings(prev => ({
      ...prev,
      maxClassSize: size
    }));
    handleSettingsChange();
  };

  // ✅ REMOVED: handleTeachingStyleChange function

  const handleSave = async () => {
    // Validation
    if (teacherSettings.preferredGrades.length === 0) {
      setSaveStatus('error');
      setErrorMessage('Please select at least one grade level');
      return;
    }

    if (teacherSettings.subjects.length === 0) {
      setSaveStatus('error');
      setErrorMessage('Please select at least one subject');
      return;
    }

    setIsLoading(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/user/teaching-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherSettings)
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus('success');
        console.log('Teaching settings saved successfully:', data);
      } else {
        setSaveStatus('error');
        setErrorMessage(data.message || 'Failed to save teaching settings');
      }
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Network error. Please check your connection.');
      console.error('Save teaching settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-blue-700">Loading your teaching preferences...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <GraduationCap className="w-6 h-6 mr-3 text-ilaw-navy" />
        <h2 className="text-xl font-semibold text-ilaw-navy">Teaching Preferences</h2>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">Teaching preferences saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Grade Levels */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="font-medium text-blue-800">Which grades do you want to teach?</h3>
            <span className="text-sm text-blue-600 ml-2">
              ({teacherSettings.preferredGrades.length} selected)
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gradeOptions.map((grade) => (
              <label 
                key={grade} 
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  teacherSettings.preferredGrades.includes(grade)
                    ? 'bg-blue-100 border-blue-300 shadow-md'
                    : 'bg-white border-blue-200 hover:bg-blue-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={teacherSettings.preferredGrades.includes(grade)}
                  onChange={(e) => handleGradeChange(grade, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-blue-800 font-medium">{grade}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="font-medium text-green-800">What subjects do you prefer to teach?</h3>
            <span className="text-sm text-green-600 ml-2">
              ({teacherSettings.subjects.length} selected)
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjectOptions.map((subject) => (
              <label 
                key={subject} 
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  teacherSettings.subjects.includes(subject)
                    ? 'bg-green-100 border-green-300 shadow-md'
                    : 'bg-white border-green-200 hover:bg-green-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={teacherSettings.subjects.includes(subject)}
                  onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-green-800 font-medium">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Class Size Preference */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            <h3 className="font-medium text-purple-800">Preferred class size</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-purple-700 font-medium">Maximum students per class:</label>
            <select 
              value={teacherSettings.maxClassSize}
              onChange={(e) => handleClassSizeChange(parseInt(e.target.value))}
              className="px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors bg-white"
            >
              <option value={15}>15 students</option>
              <option value={20}>20 students</option>
              <option value={25}>25 students</option>
              <option value={30}>30 students</option>
              <option value={35}>35 students</option>
            </select>
          </div>
          
          <div className="mt-3 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-700">
              <strong>Current preference:</strong> Up to {teacherSettings.maxClassSize} students per class
            </p>
          </div>
        </div>

        {/* ✅ REMOVED: Entire Teaching Style section */}

        <button 
  onClick={handleSave}
  disabled={isLoading || teacherSettings.preferredGrades.length === 0 || teacherSettings.subjects.length === 0}
  className="px-6 py-3 bg-ilaw-navy hover:bg-ilaw-navy text-white rounded-lg flex items-center justify-center shadow-lg min-w-[220px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
>
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Teaching Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ClassSettings;