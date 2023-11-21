import { useState } from 'react';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import IconBtn from '../icon/IconBtn';
import FullLogo from '../logo/FullLogo';
import ReactModal from 'react-modal';
import Search from '../form/Search';
import "bootstrap-icons/font/bootstrap-icons.css";
import '../modal/Modal.css';
import './Navbar.css';

/**
 * Component that displays the navbar
 * @returns Navbar Component
 */
const Navbar: React.FC = () => {

    ReactModal.setAppElement('#root');

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { width } = useWindowDimensions();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

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
                        <>
                            <IconBtn icon='bi bi-list' onClick={toggleMenu} />
                        </>
                    ) : (

                        <>
                            <IconBtn icon='bi bi-gear-fill' onClick={() => console.log("Pressed")} />
                            <IconBtn icon='bi bi-person-circle' onClick={openModal} />
                        </>
                    )}

                    <CSSTransition
                        timeout={200}
                        in={modalOpen}
                        classNames='modal'
                        unmountOnExit
                    >

                        <ReactModal className='modal'
                            overlayClassName='modal__overlay'
                            isOpen={modalOpen}
                            shouldCloseOnOverlayClick={false}
                            onRequestClose={closeModal}
                            closeTimeoutMS={200}

                        >
                            <button onClick={closeModal}>Close</button>
                        </ReactModal>
                    </CSSTransition>
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