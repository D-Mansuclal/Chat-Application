import './IconBtn.css';

interface IconBtnProps {
    icon: string;
    className?: string;
    onClick: () => void;

}

const IconBtn: React.FC<IconBtnProps> = (props : IconBtnProps) => {
    const { icon, className, onClick } = props;
    return (
        <button className={`iconBtn${className ? className : ""}`} onClick={onClick} tabIndex={0}>
            <i className={`iconBtn__icon ${icon}`}></i>
        </button>
    )
};

export default IconBtn;
