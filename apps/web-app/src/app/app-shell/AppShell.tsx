import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';

import { AlertProvider } from '../../../../../libs/alert/feature/src/lib/containers';
import { uiTheme } from '../styles';
import { AppContent } from './content/AppContent';
import { AppFooter } from './footer/AppFooter';
import { Appheader } from './header/AppHeader';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
};

export function AppShell() {
  return (
    <ThemeProvider theme={uiTheme}>
      <Box sx={styles.root}>
        <Appheader />
        <AppContent>
          <AlertProvider>
            <Outlet />
          </AlertProvider>
        </AppContent>
        <AppFooter />
      </Box>
    </ThemeProvider>
  );
}
