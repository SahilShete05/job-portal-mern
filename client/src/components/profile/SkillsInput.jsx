import React, { useState } from 'react';
import { X } from 'lucide-react';

const SkillsInput = ({ skills = [], onChange, disabled = false, error = null }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!skills.includes(newSkill)) {
        onChange([...skills, newSkill]);
        setInputValue('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-muted">
        Skills
      </label>
      <div
        className={`w-full p-3 rounded-lg border transition-colors duration-200 bg-surface ${
          error ? 'border-danger-soft bg-danger-soft' : 'border-subtle'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[color:var(--app-accent-soft)] text-[color:var(--app-accent)]"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                disabled={disabled}
                className={`inline-flex ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Add skill and press Enter..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleAddSkill}
          disabled={disabled}
          className="w-full bg-transparent border-none outline-none text-sm text-primary placeholder:text-muted"
        />
      </div>
      {error && (
        <p className="text-xs mt-1 text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default SkillsInput;
