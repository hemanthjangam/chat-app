import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Mail, User, Lock, ArrowRight } from 'lucide-react';
import './AuthPage.css';

function RegisterPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [step, setStep] = useState(1); // 1: email & username, 2: otp
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authAPI.sendOtp(email.toLowerCase().trim(), 'REGISTER');
            setSuccess('OTP sent to your email!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authAPI.verifyOtp(
                email.toLowerCase().trim(),
                otp,
                'REGISTER',
                username.trim()
            );

            if (response.data.success) {
                const userData = {
                    email: email.toLowerCase().trim(),
                    username: username.trim(),
                    id: Date.now(), // Temporary - should come from backend
                };

                setUser(userData);
                setSuccess('Registration successful!');
                setTimeout(() => navigate('/chat'), 500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join and start chatting</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="email">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="username">
                                <User size={18} />
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Choose a unique username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                maxLength={30}
                            />
                            <small className="input-hint">This will be your unique identifier</small>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send OTP
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="otp">
                                <Lock size={18} />
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <small className="input-hint">Check your email for the OTP</small>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="button-group">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setStep(1);
                                    setOtp('');
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Register
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
