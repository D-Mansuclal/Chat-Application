import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authService } from '../../services/AuthService';
import { AuthenticationModalTypes } from '../modal/AuthenticationModal';
import * as yup from 'yup';
import Button from '../form/Button';
import LogoIconLarge from '../logo/LogoIconLarge';
import './Auth.css';

/**
 * Interface for Register component props.
 * @param switchModalContents - Function to switch modal contents
 * @see {@link Register} for component
 */
interface RegisterProps {
    switchModalContents: (modal: AuthenticationModalTypes, email?: string) => void
}

/**
 * Register component contains form that allows user to Register for the application.
 * @param registerProps - Register component props
 * @returns Register component as a React Component.
 * @see {@link RegisterProps} for component props
 */
const Register: React.FC<RegisterProps> = (registerProps: RegisterProps) => {

    // Props
    const { switchModalContents } = registerProps;

    // States
    const [registrationError, setRegistrationError] = useState(String(""));
    const [loading, setLoading] = useState(Boolean(false));

    // Form validation rules
    const registrationSchema = yup.object().shape({

        username: yup.string()
            .required("A username is required")
            .min(3, "Username must contain atleast 3 characters")
            .max(15, "Username must contain at maximum 15 characters")
            .matches(/^[a-zA-Z0-9_-]*$/, "Username must only contain letters, numbers, underscores and dashes"),

        // Email Validation
        email: yup.string()
            .required("A valid email address is required")
            .matches(/^\S+@\S+\.\S+$/, "Email address is not in a valid format"),

        // Password Validation
        password: yup.string()
            .required("Password is required")
            .min(8, 'Password must be at least 8 characters')
            .matches(/(?=.*[0-9])/, 'Password must contain at least one number')
            .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
            .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter'),

        confirmPassword: yup.string()
            .oneOf([yup.ref('password'), undefined], 'Passwords must match')
    });

    // Form validation
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(registrationSchema)
    });

    /**
     * Handles the submission of the registration form. Posts to the API and sets the state of the component.
     * @param data - The data from the form.
     * @see {@link authService.register} for more information.
     */
    const onRegister = async (data: any) => {
        try {
            const { username, email, password } = data
            setLoading(true)
            await authService.register(username, email, password);
            switchModalContents(AuthenticationModalTypes.ACTIVATE, email);
        } catch (err: any) {
            if (err.response.status === 401) {
                Promise.reject("Creation Unsuccessful")
            }
            setRegistrationError(err.response.data.error);
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

            <h1 className='auth__heading'>Register for Chatterbox</h1>

            {/* Register Form */}
            <form className='auth__form' onSubmit={handleSubmit(onRegister)}>
                {registrationError && <p className='auth__error'>{registrationError}</p>}

                <input className={errors.username && 'auth__input-error'}
                    type="text" placeholder="Username" {...register('username')} 
                />
                {errors.username && <p className='auth__error'>{String(errors.username?.message)}</p>}

                <input className={errors.email && 'auth__input-error auth__no-margin-top'} 
                    type="text" placeholder="Email" {...register('email')}
                />
                {errors.email && <p className='auth__error'>{String(errors.email?.message)}</p>}

                <input className={errors.password && 'auth__input-error auth__no-margin-top'} 
                    type="password" placeholder="Password" {...register('password')} 
                />
                {errors.password && <p className='auth__error'>{String(errors.password?.message)}</p>}

                <input className={errors.confirmPassword && 'auth__input-error auth__no-margin-top'} 
                    type="password" placeholder="Confirm Password" {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className='auth__error'>{String(errors.confirmPassword?.message)}</p>}

                {loading ?
                    <Button className='loading' disabled={true} type='submit'></Button> :
                    <Button type='submit'>Register</Button>
                }

                <button className='auth__switch-form'
                    type='button'
                    onClick={() => switchModalContents(AuthenticationModalTypes.LOGIN)}
                >
                    Already have an account?
                </button>
            </form>
        </div>
    );

}

export default Register;
