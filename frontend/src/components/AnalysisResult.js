import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalysisResult = ({ resumeId }) => {
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`/api/resumes/${resumeId}/analysis/`);
        setAnalysis(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAnalysis();
  }, [resumeId]);

  return (
    <div>
      <h2>Resume Analysis</h2>
      {analysis ? <p>{analysis}</p> : <p>Loading...</p>}
    </div>
  );
};

export default AnalysisResult;