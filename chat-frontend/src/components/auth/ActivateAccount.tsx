import { useState } from 'react';
import { AuthenticationModalTypes } from '../modal/AuthenticationModal';
import { authService } from '../../services/AuthService';
import LogoIconLarge from '../logo/LogoIconLarge';
import Button from '../form/Button';
import './Auth.css';

/**
* Interface for ActivateAccount component props
* @param switchModalContents - Function to switch modal contents
* @param email - The email of the user
* @see {@link ActivateAccount} for component
*/
interface ActivateAccountProps {
    switchModalContents: (modal: AuthenticationModalTypes) => void
    email: string
}

/**
 * ActivateAccount provides information on activating an account
 * @param activateAccountProps ActivateAccount component props
 * @returns ActivateAccount component
 * @see {@link ActivateAccountProps} for component props
 */
const ActivateAccount: React.FC<ActivateAccountProps> = (activateAccountProps: ActivateAccountProps) => {

    // Props
    const { switchModalContents, email } = activateAccountProps;

    // States
    const [loading, setLoading] = useState<boolean>(false);
    const [emailResent, setEmailResent] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    /**
     * Function to resend activation email
     * @see {@link authService.resendActivationEmail}
     */
    const resendEmail = async () => {
        try {
            setLoading(true);
            await authService.resendActivationEmail(email);
            setEmailResent(true);
        }
        catch(err: any) {
            if (err.response.status === 403) {
                setError(true);
            }
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

            <h1 className='auth__heading'>Activate your account</h1>

            <div className='auth__activation-info'>

                <p className="auth__text auth__text-large">An activation email has been sent to:{email}.</p>
                <p className="auth__text">Please follow the instructions in the email to activate your account.</p>
                <p className="auth__text">If you do not receive an email, please check your spam folder.</p>
                <p className="auth__text">If you still do not receive an email,
                    please click the button below to resend the email.
                </p>

                {loading ?
                    <Button className='loading' disabled={true} type='submit'></Button> :
                    <Button onClick={resendEmail} disabled={error}
                        type='submit'>Resend Email
                    </Button>
                }

                {emailResent && <p className="auth__text">Another activation email has been sent.</p>}

                {error && 
                    <>
                        <p className="auth__error">You have already activated your account.</p>
                        <button className='auth__switch-form' onClick={() => switchModalContents(AuthenticationModalTypes.LOGIN)}>
                            Back to Login
                        </button>
                    </>
                }
            </div>  

        </div>
    )
}

export default ActivateAccount
