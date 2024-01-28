import { useState } from "react";
import { AuthenticationModalTypes } from "../modal/AuthenticationModal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { authService } from "../../services/AuthService";
import * as yup from 'yup';
import Button from "../form/Button";
import LogoIconLarge from "../logo/LogoIconLarge";
import './Auth.css';

/**
 * Interface for ForgottenPassword component props
 * @param switchModalContents - Function to switch modal contents
 * @see {@link ForgotPassword} for component
 */
interface ForgotPasswordProps {
    switchModalContents: (modal: AuthenticationModalTypes) => void
}

/**
 * ForgottenPassword component contains form that allows the user to request a password reset
 * @param forgotPasswordProps - ForgotPassword component props
 * @returns ForgotPassword component as a React Component.
 * @see {@link ForgotPasswordProps} for component props
 */
const ForgotPassword: React.FC<ForgotPasswordProps> = (forgotPasswordProps: ForgotPasswordProps) => {

    // Props
    const { switchModalContents } = forgotPasswordProps;

    // States
    const [forgotPasswordError, setForgotPasswordError] = useState(String(""));
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(Boolean(false));
    const [loading, setLoading] = useState(Boolean(false));

    // Validation
    const forgotPasswordSchema = yup.object().shape({
        email: yup.string()
        .required("A valid email address is required")
        .matches(/^\S+@\S+\.\S+$/, "Email address is not in a valid format"),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(forgotPasswordSchema)
    });

    /**
     * Function to handle the forgotten password form submission.
     * @param data - The data from the form
     * @see {@link authService.forgotPassword} for more information
     */
    const onForgotPassword = async (data: any) => {
        try {
            setLoading(true);
            await authService.forgotPassword(data.email);
            setForgotPasswordSuccess(true);
        }
        catch (err: any) {
            setForgotPasswordError(err.response.data.error);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className='auth'>

            <div className="auth__logo">
                <LogoIconLarge />
            </div>

            <h1 className='auth__heading'>Log into Chatterbox</h1>

            {/* Register Form */}
            <form className='auth__form' onSubmit={handleSubmit(onForgotPassword)}>
                {forgotPasswordError && <p className='auth__error'>{forgotPasswordError}</p>}

                <div className="auth__form-input-wrapper">

                    <input className={errors.email && 'auth__input-error auth__no-margin-top'} 
                        type="email" placeholder="Email" {...register('email')}
                    />
                    {errors.email && <p className='auth__error'>{String(errors.email?.message)}</p>}
                </div>
                
                {loading && !forgotPasswordSuccess ?
                    <Button className='loading' disabled={true} type='submit'></Button> :
                    <Button type='submit' disabled={forgotPasswordSuccess}>Reset Password</Button>
                }

                {forgotPasswordSuccess && 
                    <p className='auth__success'>Password reset link has been sent to your email address</p>
                }

                <button className='auth__switch-form'
                    type="button"
                    onClick={() => switchModalContents(AuthenticationModalTypes.LOGIN)}
                >
                    Back to Login
                </button>
            </form>
        </div>
    )
}

export default ForgotPassword;