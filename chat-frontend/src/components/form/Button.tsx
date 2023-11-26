import './Button.css'

interface ButtonProps {
    type: string,
    onClick?: () => void,
    disabled?: boolean,
    className?: string,
    children?: string
}

/**
 * Button component for forms
 * @props type Type of button
 * @props onClick Function to be called when button is clicked
 * @props disabled Whether button is disabled
 * @props className Class name for button
 * @props children Children of button
 * @returns Button
 */
const Button: React.FC<ButtonProps> = (props: any) => {

    // Destructure props
    const { type, onClick, disabled, className, children } = props;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`button ${className || ""}`}
        >
            {children}
        </button>
    ) as JSX.Element;
};

export default Button;