import { Link } from 'react-router-dom';
import IconBtn from '../icon/IconBtn';
import "bootstrap-icons/font/bootstrap-icons.css";
import './Navbar.css';
import Logo from '../logo/Logo';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
                <Link to="/" className="navbar__left">
                    <Logo />
                </Link>
            <div className="navbar__right">
                <IconBtn icon='bi bi-person-circle' onClick={() => console.log("Pressed")}/>
                <IconBtn icon='bi bi-gear-fill' onClick={() => console.log("Pressed")}/>
            </div>
        </nav>
    )
};

export default Navbar;