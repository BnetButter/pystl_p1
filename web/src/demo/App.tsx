import { useState, useMemo, useEffect } from 'react'
import { Box } from "@mui/material"
import Footer from "../components/Footer"
import Main from '../components/Main'
import './App.css'
import { MapViewProvider } from './MapViewProvider'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSnackbar } from '../hooks/useSnackBar'
import { Outlet, useNavigate } from 'react-router-dom';
import Header from "../components/Header"
import SideMenu from '../components/SideMenu'
import { useAuth0 } from '../hooks/useAuth0'
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CollectionIcon from "@mui/icons-material/Collections"
import MemoryIcon from "@mui/icons-material/Memory"
import { MapGridProvider } from '../hooks/useMapGrid'
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";

const FooterItems = [
  { label: 'Kevin Lai', href: "http://lai.git-pages.mst.edu/lai" },
  { label: 'PySTL', href: "https://pystl.com" },
]


const theme = createTheme({
  palette: {
    primary: {
      main: '#003453', // Custom primary color
    },
    text: {
      primary: '#000000',
    },
  },

});


function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate();
  const [rolePages, setRolePages] = useState<any[]>([])



  const { setLoadingSnack, closeSnack } = useSnackbar()
  const { login, logout, me } = useAuth0();



  const menuItems = useMemo(() => {
    const headers = [
      { label: 'Home', onClick: () => { navigate("/"); setMenuOpen(false); }, icon: <HomeIcon /> },
      { label: 'About', onClick: () => { navigate("/about"); setMenuOpen(false) }, icon: <InfoIcon /> },
    ]

    return [
      headers,
      rolePages,
    ]
  }, [rolePages])

  useEffect(() => {
   
    setRolePages([
      { label: 'Datasets', onClick: () => { navigate("/datasets") }, icon: <CollectionIcon /> },
      { label: 'Workers', onClick: () => { navigate("/workers") }, icon: <MemoryIcon /> },
    ])

  }
  , [ me ])

  return (
    <MapGridProvider>
      <MapViewProvider>
        <ThemeProvider theme={theme}>
          { /* Use display: flex to make sure the side menu doesn't flow on top of the main box on desktop mode */}
          <Box sx={{ display: "flex", height: '100vh', width: '100vw' }}>
            <Header
              appName='AI Model Integration Demo'
              icon="favicon.png"
              iconLink="https://pystl.com"
              isLoggedIn={me !== null}
              onLoginClick={login}
              onLogoutClick={logout}
              onMenuClick={() => setMenuOpen(!menuOpen)}
              profileClick={() => { setLoadingSnack("This button currently does nothing "); setTimeout(closeSnack, 5000) }}
              userName={me?.name}
              userAvatarUrl={me?.picture}
            >
            </Header>
            <SideMenu menuItems={menuItems} open={menuOpen} />
            { /* use component='main' to protect this section from display: 'flex' */}
            <Main>
              <Outlet />
            </Main>
            <Footer items={FooterItems} />
          </Box>
        </ThemeProvider>
      </MapViewProvider>
    </MapGridProvider>
  )
}

export default App
