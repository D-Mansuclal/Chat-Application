import { useState } from "react"
import { CSSTransition } from "react-transition-group"
import ReactModal from "react-modal"
import Register from "../auth/Register"
import Login from "../auth/Login"
import IconBtn from "../icon/IconBtn"
import ActivateAccount from "../auth/ActivateAccount"
import ForgotPassword from "../auth/ForgotPassword"
import './Modal.css'

/**
 * The types of modals that can be displayed
 * @param {("LOGIN" | "REGISTER" | "ACTIVATE" | "FORGOTPASSWORD")} type - The type of modal
 */
export enum AuthenticationModalTypes {
    "LOGIN",
    "REGISTER",
    "ACTIVATE",
    "FORGOTPASSWORD",
}

/**
 * Interface for AuthenticationModal component props
 * @param modalOpen - Whether the modal is open
 * @param closeModal - Function to close the modal
 * @see {@link AuthenticationModal} for component
 */
interface AuthenticationModalProps {
    modalOpen: boolean,
    closeModal: () => void
}

/**
 * AuthenticationModal component contains modals that allow user to login or register.
 * @param authenticationModalProps Authentication modal component props
 * @returns Authentication modal component
 * @see {@link AuthenticationModalProps} for component props
 */
const AuthenticationModal: React.FC<AuthenticationModalProps> = (authenticationModalProps: AuthenticationModalProps) => {

    // Props
    const { modalOpen, closeModal } = authenticationModalProps;

    // States
    const [modalContents, setModalContents] = useState<AuthenticationModalTypes>(AuthenticationModalTypes.LOGIN);
    const [email, setEmail] = useState<string | undefined>();

    /**
     * Switches between different modal contents
     * @param type - The type of modal to switch to
     * @param email - The email of the user if the user is not activated
     * @see {@link AuthenticationModalTypes} for modal types
     */
    const switchModalContents = (type: AuthenticationModalTypes, email?: string) => {
        setModalContents(type);
        if (email) setEmail(email);
    }

    return (
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
                <>
                    <IconBtn icon='bi bi-x' onClick={closeModal} />
                    {modalContents === AuthenticationModalTypes.LOGIN && (
                        <Login switchModalContents={switchModalContents} closeModal={closeModal} />
                    )}

                    {modalContents === AuthenticationModalTypes.REGISTER && (
                        <Register switchModalContents={switchModalContents} />
                    )}

                    {modalContents === AuthenticationModalTypes.ACTIVATE && email &&(
                        <ActivateAccount switchModalContents={switchModalContents} email={email}/>
                    )}

                    {modalContents === AuthenticationModalTypes.FORGOTPASSWORD && (
                        <ForgotPassword switchModalContents={switchModalContents} />
                    )}
                </>
            </ReactModal>
        </CSSTransition>
    )
}

export default AuthenticationModal;