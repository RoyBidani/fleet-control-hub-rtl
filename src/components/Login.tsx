
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, Car } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.login(username, password);
      
      if (response.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());
        sessionStorage.setItem('user', JSON.stringify(response.user));
        onLogin();
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to hardcoded credentials if DynamoDB is not available
      if (username === 'admin' && password === '1234') {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());
        sessionStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
        onLogin();
      } else {
        setError('שגיאה בהתחברות או שם משתמש/סיסמה שגויים');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-green-100/20"></div>
      
      <Card className="w-full max-w-md relative z-10 fleet-card fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            מערכת ניהול צי רכבים
          </CardTitle>
          <CardDescription className="text-gray-600">
            התחברו למערכת כדי לנהל את הצי שלכם
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                שם משתמש
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-right"
                placeholder="הזינו שם משתמש"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                סיסמה
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                placeholder="הזינו סיסמה"
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="slide-in-right">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full fleet-btn fleet-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  מתחבר...
                </div>
              ) : (
                'התחברות'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">פרטי התחברות לדוגמה:</h4>
            <p className="text-sm text-blue-700">שם משתמש: admin</p>
            <p className="text-sm text-blue-700">סיסמה: 1234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
