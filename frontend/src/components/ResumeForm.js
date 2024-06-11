import React, { useState } from 'react';
import axios from 'axios';

const ResumeForm = () => {
  const [personalStatement, setPersonalStatement] = useState('');
  const [education, setEducation] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [projects, setProjects] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/resumes/', {
        personal_statement: personalStatement,
        education,
        work_experience: workExperience,
        projects,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="personal-statement">Personal Statement</label>
        <textarea
          id="personal-statement"
          value={personalStatement}
          onChange={(e) => setPersonalStatement(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="education">Education</label>
        <textarea
          id="education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="work-experience">Work Experience</label>
        <textarea
          id="work-experience"
          value={workExperience}
          onChange={(e) => setWorkExperience(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="projects">Projects</label>
        <textarea
          id="projects"
          value={projects}
          onChange={(e) => setProjects(e.target.value)}
        />
      </div>
      <button type="submit">Submit Resume</button>
    </form>
  );
};

export default ResumeForm;