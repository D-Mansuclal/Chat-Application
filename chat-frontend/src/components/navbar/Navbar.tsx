import { useEffect, useState } from 'react';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { Link } from 'react-router-dom';
import IconBtn from '../icon/IconBtn';
import FullLogo from '../logo/FullLogo';
import ReactModal from 'react-modal';
import Search from '../form/Search';
import AuthenticationModal from '../modal/AuthenticationModal';
import "bootstrap-icons/font/bootstrap-icons.css";
import './Navbar.css';

/**
 * Interface for Navbar component props
 * @param accountActivatedRedirect - Whether the user has been redirected from the account activation page
 * @param setAccountActivatedRedirect - Function to set the state of accountActivatedRedirect
 * @see {@link Navbar} for component
 */
interface NavbarProps {
    accountActivatedRedirect: boolean,
    setAccountActivatedRedirect: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Component that displays the navbar
 * @param navbarProps - Navbar component props
 * @returns Navbar Component
 * @see {@link NavbarProps} for component props
 */
const Navbar: React.FC<NavbarProps> = (navbarProps: NavbarProps) => {

    ReactModal.setAppElement('#root');

    const { accountActivatedRedirect, setAccountActivatedRedirect } = navbarProps;

    // States
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { width } = useWindowDimensions();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    /**
     * Function to open the modal
     */
    const openModal = () => {
        setModalOpen(true);
    };

    useEffect(() => {
        // Check if the user has been redirected from the account activation page.
        // If so, open the login modal.
        if (accountActivatedRedirect) {
            setAccountActivatedRedirect(false);
            setModalOpen(true);
        }
    }, [accountActivatedRedirect, setAccountActivatedRedirect]);


    /**
     * Function to close the modal
     */
    const closeModal = () => {
        setModalOpen(false);
    };

    /**
     * Function to toggle the dropdown menu on mobile
     */
    const toggleMenu = () => {
        setMenuOpen(prevState => !prevState)
    }

    return (
        <>
            <nav id="nav" className="navbar">

                <Link to="/" className="navbar__left">
                    <FullLogo />
                </Link>

                <Search width={width} />

                <div className="navbar__right">
                    {width <= 360 ? (
                        <IconBtn icon='bi bi-list' onClick={toggleMenu} />
                    ) : (
                        <>
                            <IconBtn icon='bi bi-gear-fill' onClick={() => console.log("Pressed")} />
                            <IconBtn icon='bi bi-person-circle' onClick={openModal} />
                        </>
                    )}

                    <AuthenticationModal modalOpen={modalOpen} closeModal={closeModal} />
                </div>
            </nav>
            {width <= 360 && menuOpen && (
                <div className='navbar__dropdown-menu'>
                    <button className='navbar__dropdown-item' onClick={openModal}>Profile</button>
                    <button className='navbar__dropdown-item'>Settings</button>
                </div>
            )}
        </>
    )
};

export default Navbar;