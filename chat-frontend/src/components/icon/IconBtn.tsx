import './IconBtn.css';

interface IconBtnProps {
    icon: string;
    className?: string;
    onClick: () => void;

}

const IconBtn = (props : IconBtnProps) => {
    const { icon, className, onClick } = props;
    return (
        <button className={`iconBtn${className ? className : ""}`} onClick={onClick}>
            <i className={`iconBtn__icon ${icon}`}></i>
        </button>
    )
};

export default IconBtn;
