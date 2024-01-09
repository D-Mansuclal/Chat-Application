import { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { useLocation } from 'react-router-dom';
import './HomePage.css';

/**
 * Homepage mapped to the route '/' (root). Displays the posts from the server.
 * @returns HomePage Component
 */
const HomePage: React.FC = () => {

    // States
    const [accountActivatedRedirect, setAccountActivatedRedirect] = useState(Boolean(false));
    const location = useLocation();
    
    useEffect(() => {
        // Check if the user has been redirected from the account activation page.
        // If so, open the login modal.
        if (location.state && location.state.from === "account-activated") {
            delete location.state.from;
            setAccountActivatedRedirect(true);
        }
    }, [location.state])

    return (
        <Navbar accountActivatedRedirect={accountActivatedRedirect} setAccountActivatedRedirect={setAccountActivatedRedirect} />
    )
}

export default HomePage;
