import { useState } from "react";
import { useForm } from "react-hook-form";
import { authService } from "../../services/AuthService";
import { AuthenticationModalTypes } from '../modal/AuthenticationModal';
import Button from "../form/Button";
import LogoIconLarge from "../logo/LogoIconLarge";

/**
 * Interface for Login component props.
 * @param switchModalContents - Function to switch modal contents
 * @param closeModal - Function to close modal
 * @see {@link Login} for component
 */
interface LoginProps {
    switchModalContents: (modal: AuthenticationModalTypes) => void,
    closeModal: () => void
}

/**
 * Login component contains form that allows user to login to the application.
 * @param loginProps - Login component props
 * @returns Login component as a React Component.
 * @see {@link Login} for component
 */
const Login: React.FC<LoginProps> = (loginProps: LoginProps) => {

    // Props
    const { switchModalContents, closeModal } = loginProps;

    // States
    const [loginError, setLoginError] = useState(String(""));
    const [loading, setLoading] = useState(Boolean(false));

    const { register, handleSubmit, formState: { errors } } = useForm();

    /**
     * Function to handle the login form submission.
     * On success, the modal is closed and the user would be logged in.
     * @param data - The data from the form
     * @see {@link authService.login} for more information
     */
    const onLogin = async (data: any) => {
        try {
            setLoading(true);
            await authService.login(data.username, data.password);
            closeModal();
        }
        catch (err: any) {
            if (err.response.status === 401) {
                // TODO: Move to activate account page when implemented
                console.log("TEST")
            }
            setLoginError(err.response.data.error);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth'>

            <div className="auth__logo">
                <LogoIconLarge />
            </div>

            <h1 className='auth__heading'>Log into Chatterbox</h1>

            {/* Register Form */}
            <form className='auth__form' onSubmit={handleSubmit(onLogin)}>
                {loginError && <p className='auth__error'>{loginError}</p>}

                <input className={errors.username && 'auth__input-error'}
                    type="text" placeholder="Username" {...register('username', { required: "Username is required" })}
                />
                {errors.username && <p className='auth__error'>{String(errors.username?.message)}</p>}

                <input className={errors.password && 'auth__input-error auth__no-margin-top'}
                    type="password" placeholder="Password" {...register('password', { required: "Password is required" })}
                />
                {errors.password && <p className='auth__error'>{String(errors.password?.message)}</p>}

                {loading ?
                    <Button className='loading' disabled={true} type='submit'></Button> :
                    <Button type='submit'>Login</Button>
                }

                {/* TODO: Forgot password */}
                <button className='auth__switch-form'
                    type="button"
                    onClick={() => console.log("Switching")}
                >
                    Forgot your password?
                </button>

                <button className='auth__switch-form'
                    type="button"
                    onClick={() => switchModalContents(AuthenticationModalTypes.REGISTER)}
                >
                    Don't have an account?
                </button>
            </form>
        </div>
    );
};

export default Login;
