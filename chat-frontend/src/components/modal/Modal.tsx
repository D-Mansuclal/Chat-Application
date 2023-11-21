import ReactModal from "react-modal";
import { Props } from "react-modal";
import IconBtn from "../icon/IconBtn";
import './Modal.css';

interface ModalProps extends Props{
    width?: number;
}

const Modal: React.FC<ModalProps> = (ModalProps) => {

    ReactModal.setAppElement('#root');

    const { className, isOpen, children, overlayClassName, onRequestClose, closeTimeoutMS } = ModalProps;

    return (
        <ReactModal className={className} isOpen={isOpen} closeTimeoutMS={closeTimeoutMS}
            overlayClassName={overlayClassName} onRequestClose={onRequestClose}>
            {children}
        </ReactModal>
    )
}

export default Modal;