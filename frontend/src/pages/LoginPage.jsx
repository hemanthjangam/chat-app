import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './AuthPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [step, setStep] = useState(1); // 1: email, 2: otp
    const [email, setEmail] = useState('');
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
            await authAPI.sendOtp(email.toLowerCase().trim(), 'LOGIN');
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
            const response = await authAPI.verifyOtp(email.toLowerCase().trim(), otp, 'LOGIN');

            if (response.data.success) {
                // Map the flattened response to user object
                const userData = {
                    id: response.data.userId,
                    email: response.data.email,
                    username: response.data.username,
                    profilePicture: response.data.profilePicture,
                    bio: response.data.bio,
                    status: response.data.status,
                    isActive: response.data.isActive
                };

                setUser(userData);
                setSuccess('Login successful!');
                setTimeout(() => navigate('/chat'), 500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Login to continue chatting</p>
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
                                        Login
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
