import { useState } from 'react';
import { Shield, Lock, Unlock, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useEncryption } from '@/lib/encryption-context';
import { toast } from 'sonner';

export function EncryptionSettings() {
  const {
    isEncryptionEnabled,
    enableEncryption,
    disableEncryption,
    publicKey,
    hasEncryptionKey,
  } = useEncryption();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableEncryption = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      await enableEncryption(password);
      toast.success('End-to-End Encryption enabled successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to enable encryption');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableEncryption = () => {
    if (confirm('Are you sure? This will remove all encryption keys.')) {
      disableEncryption();
      toast.success('End-to-End Encryption disabled');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>End-to-End Encryption</CardTitle>
          </div>
          {isEncryptionEnabled && (
            <Badge variant="default" className="gap-1">
              <Lock size={12} />
              Enabled
            </Badge>
          )}
        </div>
        <CardDescription>
          Protect your sensitive data with client-side encryption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEncryptionEnabled ? (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                Once enabled, all your messages, posts, and sensitive data will be encrypted on
                your device before being sent to the server. Make sure to remember your encryption
                password - it cannot be recovered.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encryption-password">Encryption Password</Label>
                <Input
                  id="encryption-password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                onClick={handleEnableEncryption}
                disabled={isLoading || !password || !confirmPassword}
                className="w-full"
              >
                {isLoading ? (
                  'Enabling...'
                ) : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Enable End-to-End Encryption
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <Lock className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">
                Encryption Active
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your data is protected with end-to-end encryption. All sensitive information is
                encrypted on your device before transmission.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key size={16} />
                  Public Key
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-xs break-all">{publicKey?.substring(0, 100)}...</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this key with others to allow them to send you encrypted messages.
                </p>
              </div>

              <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Encryption Status</p>
                  <p className="text-xs text-muted-foreground">
                    {hasEncryptionKey ? 'Keys loaded and ready' : 'No encryption key found'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDisableEncryption}
                variant="destructive"
                className="w-full"
              >
                <Unlock size={16} className="mr-2" />
                Disable Encryption
              </Button>
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Features</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              <span>AES-256-GCM symmetric encryption for data</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              <span>RSA-2048 asymmetric encryption for key exchange</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              <span>PBKDF2 password-based key derivation (100,000 iterations)</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              <span>Client-side encryption - keys never leave your device</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
