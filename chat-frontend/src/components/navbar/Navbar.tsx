import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { Link } from 'react-router-dom';
import IconBtn from '../icon/IconBtn';
import FullLogo from '../logo/FullLogo';
import Search from '../form/Search';
import "bootstrap-icons/font/bootstrap-icons.css";
import './Navbar.css';

/**
 * Component that displays the navbar
 * @returns Navbar Component
 */
const Navbar: React.FC = () => {

    const { width } = useWindowDimensions();

    return (
        <nav id="nav" className="navbar">
            <Link to="/" className="navbar__left">
                <FullLogo />
            </Link>
            <Search width={width} />
            <div className="navbar__right">
                {width <= 360 ? 
                    <IconBtn icon='bi bi-list' onClick={() => console.log(window.innerWidth)} /> :
                    <>
                    <IconBtn icon='bi bi-gear-fill' onClick={() => console.log("Pressed")} />
                    <IconBtn icon='bi bi-person-circle' onClick={() => console.log("Pressed")} />
                    </>
                }
                {/* <IconBtn icon='bi bi-person-circle' onClick={() => console.log("Pressed")} />
                <IconBtn icon='bi bi-list' onClick={() => console.log(window.innerWidth)}/> */}
            </div>
        </nav>
    )
};

export default Navbar;