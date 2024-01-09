import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/AuthService';
import LogoIconLarge from '../logo/LogoIconLarge';
import './Auth.css'

/**
 * Account activation component. Should only be displayed if directed from the activation email sent to the user's email.
 * Redirect to root if token and username are not in the search params.
 * @returns Account activation component
 */
const AccountActivated: React.FC = () => {

    // States
    const [successfulActivation, setSuccessfulActivation] = useState(Boolean(false));
    const [error , setError] = useState(String(''));
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to root if token and username are not in the search params
        if (!searchParams.has('token') || !searchParams.has('username')) return navigate('/');

        // Activate account
        const token = searchParams.get('token');
        const username = searchParams.get('username');
        activateAccount(token!, username!);
    }, [navigate, searchParams])

    /**
     * Function to activate account
     * @param token The token from url search parameters
     * @param username The username from the url search parameters
     */
    const activateAccount = async (token: string, username: string) => {
        try {
            await authService.activateAccount(token, username);
            setSuccessfulActivation(true);
            
        }
        catch (err: any) {
            if (err.response.status === 400) {
                setError(err.response.data.error);
            }
        }
    }

    return (
        <div className='modal'>

            <div className='auth'>

                <div className="auth__logo">
                    <LogoIconLarge />
                </div>

                <div className="auth__form auth__form-activate">

                    <h1 className='auth__heading'>Account Activation</h1>
                    {successfulActivation &&
                        <>
                            <h3 className='auth__subheading'>Account activated successfully</h3>
                            <p className='auth__text'>Your account has been activated. You can now log into your account.</p>
                            <Link to='/' state={{ from: "account-activated" }} className='auth__switch-form'>
                                Click here to login
                            </Link>
                        </>
                    }

                    {error &&
                        <>
                            <h3 className='auth__subheading'>Account activation failed</h3>
                            {error && <p className='auth__error'>Your account may have already been activated, 
                                or the activation link may have expired. Please try logging in.
                            </p>}
                        </>
                    }


                </div>
            </div>
        </div>
    )
}

export default AccountActivated
