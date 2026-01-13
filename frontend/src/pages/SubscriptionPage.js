import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { subscribeUser } from '../services/api';

const SubscriptionPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const plans = [
        {
            id: 'basic',
            name: 'Active',
            price: '$0',
            features: ['Access to basic courses', 'Limited daily videos', 'Community support'],
            color: 'primary',
            recommended: false
        },
        {
            id: 'medium',
            name: 'Medium',
            price: '$29',
            features: ['Everything in Active', 'Unlimited daily videos', 'Certificate of completion', 'Email support'],
            color: 'success',
            recommended: true
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$99',
            features: ['Everything in Medium', '1-on-1 Mentorship', 'Job placement assistance', 'Priority 24/7 support'],
            color: 'dark',
            recommended: false
        }
    ];

    const handleSubscribe = async (planId) => {
        try {
            setProcessing(true);
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await subscribeUser(user._id, planId);
            if (res.data.success) {
                // Update local storage
                const updatedUser = { ...user, isSubscribed: true, plan: planId };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                alert(`Successfully subscribed to ${planId.toUpperCase()} plan!`);

                // Navigate back to dashboard and reload to refresh context
                navigate('/student-dashboard');
                window.location.reload();
            }
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('Failed to subscribe. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold">Choose Your Plan</h1>
                <p className="lead text-muted">Unlock your full potential with our premium learning tiers</p>
            </div>

            <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                {plans.map((plan) => (
                    <div className="col" key={plan.id}>
                        <div className={`card mb-4 rounded-3 shadow-sm ${plan.recommended ? 'border-primary' : ''}`}>
                            {plan.recommended && (
                                <div className="card-header py-3 text-white bg-primary border-primary">
                                    <h4 className="my-0 fw-normal">Most Popular</h4>
                                </div>
                            )}
                            <div className={`card-header py-3 ${!plan.recommended ? 'bg-transparent' : ''}`}>
                                <h4 className="my-0 fw-normal">{plan.name}</h4>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title">{plan.price}<small className="text-muted fw-light">/mo</small></h1>
                                <ul className="list-unstyled mt-3 mb-4 text-start ps-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="mb-2">
                                            <i className="bi bi-check-lg text-success me-2"></i>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    type="button"
                                    className={`w-100 btn btn-lg ${plan.recommended ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handleSubscribe(plan.name)}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : (user?.isSubscribed ? 'Current Plan' : 'Get stated')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-4">
                <button className="btn btn-link text-muted" onClick={() => navigate(-1)}>
                    Cancel and go back
                </button>
            </div>
        </div>
    );
};

export default SubscriptionPage;
