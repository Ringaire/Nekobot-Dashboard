import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { useAuth } from 'contexts/AuthContext';
import RemixIcon from 'ui-component/extended/RemixIcon';

interface LoginErrors {
  username?: string;
  password?: string;
  submit?: string;
}

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  const redirectTo = ((location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard') as string;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, submit: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};
    if (!formData.username) nextErrors.username = '请输入用户名';
    if (!formData.password) nextErrors.password = '请输入密码';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      await login(formData);

      if (!remember) {
        const token = window.localStorage.getItem('access_token');
        const username = window.localStorage.getItem('username');
        if (token && username) {
          window.sessionStorage.setItem('access_token', token);
          window.sessionStorage.setItem('username', username);
          window.localStorage.removeItem('access_token');
          window.localStorage.removeItem('username');
        }
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '登录失败，请检查用户名和密码' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          sx={{
            width: 470,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: theme.shadows[4],
            borderRadius: 2
          }}
        >
          <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 600, color: 'primary.main' }}>
            NekoBot Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
            登录以访问管理面板
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <FormControl fullWidth error={Boolean(errors.username)} sx={{ mb: 2 }}>
              <InputLabel htmlFor="login-username">用户名</InputLabel>
              <OutlinedInput
                id="login-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                label="用户名"
                placeholder="请输入用户名"
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
              />
              {errors.username && <FormHelperText>{errors.username}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={Boolean(errors.password)} sx={{ mb: 2 }}>
              <InputLabel htmlFor="login-password">密码</InputLabel>
              <OutlinedInput
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                label="密码"
                placeholder="请输入密码"
                autoComplete="current-password"
                disabled={isSubmitting}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <RemixIcon className="ri-eye-line" /> : <RemixIcon className="ri-eye-off-line" />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
            </FormControl>

            <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} color="primary" size="small" />}
                label="记住我"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            </Stack>

            {errors.submit && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.light', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                <Typography color="error.dark" variant="body2" sx={{ fontWeight: 500 }}>
                  {errors.submit}
                </Typography>
              </Box>
            )}

            <Button type="submit" fullWidth size="large" variant="contained" color="primary" disabled={isSubmitting} sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}>
              {isSubmitting ? '登录中...' : '登录'}
            </Button>
          </Box>

          <Box sx={{ width: '100%', mt: 3, borderTop: `1px solid ${theme.palette.divider}` }} />
          <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
            OfficialNekoTeam © {new Date().getFullYear()}
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
