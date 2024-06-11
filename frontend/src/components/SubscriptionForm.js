import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionForm = () => {
  const [plan, setPlan] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get('/api/subscription/');
        setSubscription(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubscription();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch('/api/subscription/', { plan });
      setSubscription(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Current Subscription</h2>
      {subscription ? (
        <p>
          Plan: {subscription.plan} | Expires: {subscription.expires_at}
        </p>
      ) : (
        <p>Loading...</p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="plan">New Plan</label>
          <select
            id="plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="">Select a plan</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <button type="submit">Update Subscription</button>
      </form>
    </div>
  );
};

export default SubscriptionForm;