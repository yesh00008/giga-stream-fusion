import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DebugSupabase() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const tests: any = {
      timestamp: new Date().toISOString(),
      user: null,
      profileCheck: null,
      profileCreate: null,
      tablesCheck: null,
    };

    try {
      // Test 1: Check user
      tests.user = {
        id: user?.id,
        email: user?.email,
        authenticated: !!user,
      };

      // Test 2: Check if profiles table exists
      const { data: tableData, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      tests.tablesCheck = {
        success: !tableError,
        error: tableError?.message,
        hasData: !!tableData,
        count: tableData?.length || 0,
      };

      if (user?.id) {
        // Test 3: Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        tests.profileCheck = {
          exists: !!profileData,
          data: profileData,
          error: profileError?.message,
        };

        // Test 4: Try to create profile if doesn't exist
        if (!profileData && !profileError) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
              }
            ])
            .select()
            .single();

          tests.profileCreate = {
            success: !createError,
            data: newProfile,
            error: createError?.message,
            errorDetails: createError,
          };
        }
      }
    } catch (error: any) {
      tests.error = {
        message: error.message,
        details: error,
      };
    }

    setResults(tests);
    setLoading(false);
  };

  const clearProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Profile deleted! Run test again to recreate.');
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Debug Tool</CardTitle>
          <CardDescription>
            Test Supabase connection and profile creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Run Tests'}
            </Button>
            <Button onClick={clearProfile} variant="destructive" disabled={loading || !user}>
              Delete Profile (for testing)
            </Button>
          </div>

          {results && (
            <div className="space-y-4 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Results</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Timestamp: {new Date(results.timestamp).toLocaleString()}
                </p>

                {/* User Info */}
                <div className="mb-4">
                  <h4 className="font-medium flex items-center gap-2">
                    User Authentication 
                    {results.user?.authenticated ? 
                      <Badge variant="default">✓ Authenticated</Badge> : 
                      <Badge variant="destructive">✗ Not Logged In</Badge>
                    }
                  </h4>
                  <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto">
                    {JSON.stringify(results.user, null, 2)}
                  </pre>
                </div>

                {/* Tables Check */}
                <div className="mb-4">
                  <h4 className="font-medium flex items-center gap-2">
                    Profiles Table Check
                    {results.tablesCheck?.success ? 
                      <Badge variant="default">✓ Exists</Badge> : 
                      <Badge variant="destructive">✗ Error</Badge>
                    }
                  </h4>
                  <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto">
                    {JSON.stringify(results.tablesCheck, null, 2)}
                  </pre>
                </div>

                {/* Profile Check */}
                {results.profileCheck && (
                  <div className="mb-4">
                    <h4 className="font-medium flex items-center gap-2">
                      Profile Check
                      {results.profileCheck?.exists ? 
                        <Badge variant="default">✓ Profile Exists</Badge> : 
                        <Badge variant="secondary">Profile Not Found</Badge>
                      }
                    </h4>
                    <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-64">
                      {JSON.stringify(results.profileCheck, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Profile Create */}
                {results.profileCreate && (
                  <div className="mb-4">
                    <h4 className="font-medium flex items-center gap-2">
                      Profile Creation
                      {results.profileCreate?.success ? 
                        <Badge variant="default">✓ Created</Badge> : 
                        <Badge variant="destructive">✗ Failed</Badge>
                      }
                    </h4>
                    <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-64">
                      {JSON.stringify(results.profileCreate, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Global Error */}
                {results.error && (
                  <div className="mb-4">
                    <h4 className="font-medium text-destructive">Error</h4>
                    <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto">
                      {JSON.stringify(results.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
